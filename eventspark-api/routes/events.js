const express = require('express');
const { body, query } = require('express-validator');
const Event = require('../models/Event');
const { handleValidationErrors, sanitizeInput } = require('../middleware/validate');
const { optionalAuth, protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/events
// @desc    Create a new event
// @access  Private (Organizer/Admin only)
router.post('/', [
    protect,
    authorize('organizer', 'admin'),
    body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
    body('date').isISO8601().withMessage('Invalid date format'),
    body('venue.name').trim().notEmpty().withMessage('Venue name is required'),
    body('venue.address').trim().notEmpty().withMessage('Venue address is required'),
    body('venue.city').trim().notEmpty().withMessage('Venue city is required'),
    body('venue.capacity').isInt({ min: 1 }).withMessage('Venue capacity must be at least 1'),
    body('category').isIn(['Concert', 'Sports', 'Conference', 'Workshop', 'Theater', 'Comedy', 'Other']).withMessage('Invalid category'),
    body('priceTiers').isArray({ min: 1 }).withMessage('At least one price tier is required'),
    body('priceTiers.*.tier').isIn(['VIP', 'Premium', 'General', 'Student']).withMessage('Invalid price tier'),
    body('priceTiers.*.price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('seatMap').isArray({ min: 1 }).withMessage('At least one seat is required'),
    handleValidationErrors
], async (req, res) => {
    try {
        const {
            title,
            description,
            date,
            venue,
            category,
            priceTiers,
            seatMap,
            status = 'draft',
            imageUrl,
            tags
        } = req.body;

        // Validate that date is in the future
        const eventDate = new Date(date);
        if (eventDate <= new Date()) {
            return res.status(400).json({
                error: 'Invalid event date',
                message: 'Event date must be in the future'
            });
        }

        // Create event object
        const eventData = {
            title: sanitizeInput(title),
            description: sanitizeInput(description),
            date: eventDate,
            venue: {
                name: sanitizeInput(venue.name),
                address: sanitizeInput(venue.address),
                city: sanitizeInput(venue.city),
                capacity: venue.capacity
            },
            category,
            organizer: req.user.id,
            priceTiers,
            seatMap: seatMap.map(seat => ({
                ...seat,
                isAvailable: true,
                isBooked: false
            })),
            totalSeats: seatMap.length,
            availableSeats: seatMap.length,
            status,
            imageUrl,
            tags: tags || []
        };

        const event = new Event(eventData);
        await event.save();

        // Populate organizer info for response
        await event.populate('organizer', 'name email');

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: {
                event
            }
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({
            error: 'Failed to create event',
            message: 'Unable to create event at this time'
        });
    }
});

// @route   GET /api/events
// @desc    Get all events with optional filtering
// @access  Public
router.get('/', [
    optionalAuth,
    query('date').optional().isISO8601().withMessage('Invalid date format'),
    query('category').optional().isIn(['Concert', 'Sports', 'Conference', 'Workshop', 'Theater', 'Comedy', 'Other']),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { date, category, page = 1, limit = 10 } = req.query;
        
        // Build filter object
        const filter = { status: 'published' };
        
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            filter.date = { $gte: startDate, $lt: endDate };
        }
        
        if (category) {
            filter.category = category;
        }

        const skip = (page - 1) * limit;
        
        const events = await Event.find(filter)
            .populate('organizer', 'name email')
            .sort({ date: 1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-seatMap'); // Don't include detailed seat map in list

        const total = await Event.countDocuments(filter);

        res.json({
            success: true,
            data: events,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
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
router.get('/:id', [
    optionalAuth
], async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'name email')
            .select('-seatMap'); // Don't include detailed seat map

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

// @route   GET /api/events/:id/seats
// @desc    Get seat map for a specific event
// @access  Public
router.get('/:id/seats', [
    optionalAuth
], async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .select('seatMap priceTiers title date venue');

        if (!event) {
            return res.status(404).json({
                error: 'Event not found',
                message: 'The requested event does not exist'
            });
        }

        if (event.status !== 'published') {
            return res.status(400).json({
                error: 'Event not available',
                message: 'This event is not available for booking'
            });
        }

        // Transform seat data for frontend consumption
        const seats = event.seatMap.map(seat => ({
            row: seat.row,
            number: seat.number,
            tier: seat.tier,
            available: seat.isAvailable && !seat.isBooked,
            price: event.priceTiers.find(tier => tier.tier === seat.tier)?.price || 0
        }));

        res.json({
            success: true,
            data: {
                eventId: event._id,
                eventTitle: event.title,
                eventDate: event.date,
                venue: event.venue,
                priceTiers: event.priceTiers,
                seats: seats,
                totalSeats: event.totalSeats,
                availableSeats: event.availableSeats
            }
        });
    } catch (error) {
        console.error('Get seats error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                error: 'Event not found',
                message: 'The requested event does not exist'
            });
        }
        res.status(500).json({
            error: 'Failed to fetch seat map',
            message: 'Unable to retrieve seat information at this time'
        });
    }
});

module.exports = router; 