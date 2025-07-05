const mongoose = require('mongoose');

const bookedSeatSchema = new mongoose.Schema({
    row: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        required: true
    },
    tier: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: [true, 'Event is required']
    },
    seats: [bookedSeatSchema],
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['stripe', 'paypal', 'cash'],
        default: 'stripe'
    },
    paymentIntentId: String,
    bookingReference: {
        type: String,
        unique: true,
        required: true
    },
    specialRequests: String,
    cancelledAt: Date,
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    cancellationReason: String
}, {
    timestamps: true
});

// Generate booking reference before saving
bookingSchema.pre('save', function(next) {
    if (!this.bookingReference) {
        this.bookingReference = 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
    next();
});

// Calculate total amount before saving
bookingSchema.pre('save', function(next) {
    if (this.seats && this.seats.length > 0) {
        this.totalAmount = this.seats.reduce((total, seat) => total + seat.price, 0);
    }
    next();
});

// Virtual for checking if booking is active
bookingSchema.virtual('isActive').get(function() {
    return this.status === 'confirmed' && this.paymentStatus === 'completed';
});

// Virtual for checking if booking can be cancelled
bookingSchema.virtual('canBeCancelled').get(function() {
    return this.status === 'confirmed' && this.paymentStatus === 'completed';
});

// Index for better query performance
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ event: 1, status: 1 });
bookingSchema.index({ bookingReference: 1 });
bookingSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Booking', bookingSchema); 