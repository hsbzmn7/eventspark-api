const express = require('express');
const { body } = require('express-validator');
const Ticket = require('../models/Ticket');
const { handleValidationErrors, sanitizeInput } = require('../middleware/validate');

const router = express.Router();

// @route   POST /api/tickets/validate
// @desc    Validate a ticket for event entry
// @access  Public
router.post('/validate', [
    sanitizeInput,
    body('ticketId')
        .notEmpty()
        .withMessage('Ticket ID is required'),
    body('qrCodeData')
        .notEmpty()
        .withMessage('QR code data is required'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { ticketId, qrCodeData } = req.body;

        // Find the ticket
        const ticket = await Ticket.findById(ticketId)
            .populate('event', 'title date venue')
            .populate('user', 'name email');

        if (!ticket) {
            return res.status(404).json({
                error: 'Ticket not found',
                message: 'The requested ticket does not exist'
            });
        }

        // Validate QR code data
        if (ticket.qrCode.data !== qrCodeData) {
            return res.status(400).json({
                error: 'Invalid ticket',
                message: 'QR code data does not match ticket'
            });
        }

        // Check if ticket is valid
        if (!ticket.isValid) {
            return res.status(410).json({
                error: 'Ticket not valid',
                message: ticket.isExpired ? 'Ticket has expired' : 'Ticket is not active',
                details: {
                    status: ticket.status,
                    validFrom: ticket.validFrom,
                    validUntil: ticket.validUntil,
                    isExpired: ticket.isExpired
                }
            });
        }

        // Check if ticket has already been used
        if (ticket.status === 'used') {
            return res.status(410).json({
                error: 'Ticket already used',
                message: 'This ticket has already been used for entry',
                details: {
                    usedAt: ticket.usedAt,
                    usedBy: ticket.usedBy
                }
            });
        }

        // Mark ticket as used
        ticket.status = 'used';
        ticket.usedAt = new Date();
        ticket.usedBy = req.user?._id; // If validator is logged in

        await ticket.save();

        res.json({
            success: true,
            message: 'Ticket validated successfully',
            data: {
                valid: true,
                ticketId: ticket._id,
                ticketNumber: ticket.ticketNumber,
                event: ticket.event,
                seat: ticket.seat,
                user: ticket.user,
                validatedAt: ticket.usedAt
            }
        });

    } catch (error) {
        console.error('Ticket validation error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                error: 'Ticket not found',
                message: 'The requested ticket does not exist'
            });
        }
        res.status(500).json({
            error: 'Ticket validation failed',
            message: 'Unable to validate ticket at this time'
        });
    }
});

// @route   GET /api/tickets/user/:userId
// @desc    Get all tickets for a user
// @access  Private
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUser = req.user?._id;

        // Check if user is requesting their own tickets or is admin
        if (!requestingUser || 
            (requestingUser.toString() !== userId && req.user?.role !== 'admin')) {
            return res.status(403).json({
                error: 'Access denied',
                message: 'You can only view your own tickets'
            });
        }

        const tickets = await Ticket.find({ user: userId })
            .populate('event', 'title date venue')
            .populate('booking', 'bookingReference')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: tickets.map(ticket => ({
                ticketId: ticket._id,
                ticketNumber: ticket.ticketNumber,
                event: ticket.event,
                seat: ticket.seat,
                price: ticket.price,
                status: ticket.status,
                qrCodeData: ticket.qrCode.data,
                validFrom: ticket.validFrom,
                validUntil: ticket.validUntil,
                isValid: ticket.isValid,
                isExpired: ticket.isExpired,
                bookingReference: ticket.booking?.bookingReference
            }))
        });

    } catch (error) {
        console.error('Get user tickets error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                error: 'User not found',
                message: 'The requested user does not exist'
            });
        }
        res.status(500).json({
            error: 'Failed to fetch tickets',
            message: 'Unable to retrieve tickets at this time'
        });
    }
});

// @route   GET /api/tickets/:ticketId
// @desc    Get specific ticket details
// @access  Private
router.get('/:ticketId', async (req, res) => {
    try {
        const { ticketId } = req.params;
        const requestingUser = req.user?._id;

        const ticket = await Ticket.findById(ticketId)
            .populate('event', 'title date venue')
            .populate('user', 'name email')
            .populate('booking', 'bookingReference');

        if (!ticket) {
            return res.status(404).json({
                error: 'Ticket not found',
                message: 'The requested ticket does not exist'
            });
        }

        // Check if user owns this ticket or is admin
        if (!requestingUser || 
            (requestingUser.toString() !== ticket.user._id.toString() && 
             req.user?.role !== 'admin')) {
            return res.status(403).json({
                error: 'Access denied',
                message: 'You can only view your own tickets'
            });
        }

        res.json({
            success: true,
            data: {
                ticketId: ticket._id,
                ticketNumber: ticket.ticketNumber,
                event: ticket.event,
                seat: ticket.seat,
                price: ticket.price,
                status: ticket.status,
                qrCodeData: ticket.qrCode.data,
                validFrom: ticket.validFrom,
                validUntil: ticket.validUntil,
                isValid: ticket.isValid,
                isExpired: ticket.isExpired,
                user: ticket.user,
                bookingReference: ticket.booking?.bookingReference,
                usedAt: ticket.usedAt
            }
        });

    } catch (error) {
        console.error('Get ticket error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                error: 'Ticket not found',
                message: 'The requested ticket does not exist'
            });
        }
        res.status(500).json({
            error: 'Failed to fetch ticket',
            message: 'Unable to retrieve ticket at this time'
        });
    }
});

module.exports = router; 