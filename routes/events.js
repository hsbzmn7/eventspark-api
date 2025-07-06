const express = require('express');
const { body, query } = require('express-validator');
const Event = require('../models/Event');
const { handleValidationErrors } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/events
// @desc    Get all events with optional filtering
// @access  Public
router.get('/', [
    query('date').optional().isISO8601().withMessage('Invalid date format'),
    query('category').optional().isIn(['Concert', 'Sports', 'Conference', 'Workshop', 'Theater', 'Comedy', 'Other']),
    handleValidationErrors
], async (req, res) => {
    try {
        const { date, category } = req.query;
        
        // Build filter object
        const filter = {};
        
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            filter.date = { $gte: startDate, $lt: endDate };
        }
        
        if (category) {
            filter.category = category;
        }

        const events = await Event.find(filter)
            .populate('organizer', 'name email')
            .sort({ date: 1 });

        res.json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({
            error: 'Failed to fetch events',
            message: 'Unable to retrieve events at this time'
        });
    }
});

// @route   GET /api/events/:id
// @desc    Get single event by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'name email');

        if (!event) {
            return res.status(404).json({
                error: 'Event not found',
                message: 'The requested event does not exist'
            });
        }

        res.json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Get event error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                error: 'Event not found',
                message: 'The requested event does not exist'
            });
        }
        res.status(500).json({
            error: 'Failed to fetch event',
            message: 'Unable to retrieve event at this time'
        });
    }
});

// @route   POST /api/events
// @desc    Create a new event (Organizer only)
// @access  Private
router.post('/', [
    protect,
    authorize('organizer'),
    body('title')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters'),
    body('description')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Description must be between 10 and 500 characters'),
    body('date')
        .isISO8601()
        .withMessage('Invalid date format'),
    body('venue')
        .trim()
        .notEmpty()
        .withMessage('Venue is required'),
    body('category')
        .isIn(['Concert', 'Sports', 'Conference', 'Workshop', 'Theater', 'Comedy', 'Other'])
        .withMessage('Invalid category'),
    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    handleValidationErrors
], async (req, res) => {
    try {
        const {
            title,
            description,
            date,
            venue,
            category,
            price
        } = req.body;

        // Validate event date is in the future
        if (new Date(date) <= new Date()) {
            return res.status(400).json({
                error: 'Invalid event date',
                message: 'Event date must be in the future'
            });
        }

        const event = await Event.create({
            title,
            description,
            date,
            venue,
            category,
            price,
            organizer: req.user._id
        });

        // Populate organizer details
        await event.populate('organizer', 'name email');

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: event
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({
            error: 'Failed to create event',
            message: 'Unable to create event at this time'
        });
    }
});

module.exports = router; 