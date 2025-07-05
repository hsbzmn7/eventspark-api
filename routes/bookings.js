const express = require('express');
const { body } = require('express-validator');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const { handleValidationErrors, sanitizeInput } = require('../middleware/validate');

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', [
    sanitizeInput,
    body('eventId')
        .notEmpty()
        .withMessage('Event ID is required'),
    body('seats')
        .isArray({ min: 1 })
        .withMessage('At least one seat must be selected'),
    body('seats.*.row')
        .notEmpty()
        .withMessage('Seat row is required'),
    body('seats.*.number')
        .isInt({ min: 1 })
        .withMessage('Seat number must be a positive integer'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { eventId, seats, paymentMethod = 'stripe', specialRequests } = req.body;
        const userId = req.user?._id;

        // Check if user is authenticated
        if (!userId) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Please login to make a booking'
            });
        }

        // Find the event
        const event = await Event.findById(eventId);
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

        // Check if event is sold out
        if (event.availableSeats === 0) {
            return res.status(409).json({
                error: 'Event sold out',
                message: 'This event is completely sold out'
            });
        }

        // Validate and check seat availability
        const selectedSeats = [];
        let totalAmount = 0;

        for (const seatRequest of seats) {
            const { row, number } = seatRequest;
            
            // Find the seat in the event's seat map
            const seat = event.seatMap.find(s => 
                s.row === row && s.number === number
            );

            if (!seat) {
                return res.status(400).json({
                    error: 'Invalid seat',
                    message: `Seat ${row}${number} does not exist for this event`
                });
            }

            if (!seat.isAvailable || seat.isBooked) {
                return res.status(409).json({
                    error: 'Seat already booked',
                    message: `Seat ${row}${number} is not available`
                });
            }

            // Get price for this seat tier
            const priceTier = event.priceTiers.find(pt => pt.tier === seat.tier);
            if (!priceTier) {
                return res.status(400).json({
                    error: 'Invalid seat tier',
                    message: `Price tier not found for seat ${row}${number}`
                });
            }

            selectedSeats.push({
                row: seat.row,
                number: seat.number,
                tier: seat.tier,
                price: priceTier.price
            });

            totalAmount += priceTier.price;
        }

        // Create the booking
        const booking = await Booking.create({
            user: userId,
            event: eventId,
            seats: selectedSeats,
            totalAmount,
            paymentMethod,
            specialRequests
        });

        // Update event seat availability
        for (const seatRequest of seats) {
            const seatIndex = event.seatMap.findIndex(s => 
                s.row === seatRequest.row && s.number === seatRequest.number
            );
            
            if (seatIndex !== -1) {
                event.seatMap[seatIndex].isBooked = true;
            }
        }

        // Recalculate available seats
        event.availableSeats = event.seatMap.filter(seat => 
            seat.isAvailable && !seat.isBooked
        ).length;

        await event.save();

        // Create tickets for each seat
        const tickets = [];
        for (const seat of selectedSeats) {
            const ticket = await Ticket.create({
                booking: booking._id,
                event: eventId,
                user: userId,
                seat: {
                    row: seat.row,
                    number: seat.number,
                    tier: seat.tier
                },
                price: seat.price,
                validUntil: new Date(event.date.getTime() + 2 * 60 * 60 * 1000) // 2 hours after event
            });
            tickets.push(ticket);
        }

        // Populate booking with event and user details
        await booking.populate([
            { path: 'event', select: 'title date venue' },
            { path: 'user', select: 'name email' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: {
                bookingId: booking._id,
                bookingReference: booking.bookingReference,
                status: booking.status,
                totalAmount: booking.totalAmount,
                seats: booking.seats,
                event: booking.event,
                tickets: tickets.map(ticket => ({
                    ticketId: ticket._id,
                    ticketNumber: ticket.ticketNumber,
                    seat: ticket.seat,
                    qrCodeData: ticket.qrCode.data
                })),
                paymentStatus: booking.paymentStatus,
                createdAt: booking.createdAt
            }
        });

    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            error: 'Booking failed',
            message: 'Unable to create booking at this time'
        });
    }
});

// @route   GET /api/bookings
// @desc    Get user's bookings
// @access  Private
router.get('/', async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Please login to view your bookings'
            });
        }

        const bookings = await Booking.find({ user: userId })
            .populate('event', 'title date venue')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            error: 'Failed to fetch bookings',
            message: 'Unable to retrieve bookings at this time'
        });
    }
});

module.exports = router; 