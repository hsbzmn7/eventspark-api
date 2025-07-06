const mongoose = require('mongoose');

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
    seats: [{
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
    }],
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Total amount cannot be negative']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'debit_card', 'paypal', 'stripe'],
        required: [true, 'Payment method is required']
    },
    paymentIntentId: String,
    bookingDate: {
        type: Date,
        default: Date.now
    },
    specialRequests: {
        type: String,
        maxlength: [500, 'Special requests cannot exceed 500 characters']
    },
    cancellationReason: String,
    refundAmount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Calculate total amount before saving
bookingSchema.pre('save', function(next) {
    if (this.seats && this.seats.length > 0) {
        this.totalAmount = this.seats.reduce((sum, seat) => sum + seat.price, 0);
    }
    next();
});

// Virtual for number of seats
bookingSchema.virtual('seatCount').get(function() {
    return this.seats ? this.seats.length : 0;
});

// Index for better query performance
bookingSchema.index({ user: 1, bookingDate: -1 });
bookingSchema.index({ event: 1, status: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ status: 1, bookingDate: -1 });

module.exports = mongoose.model('Booking', bookingSchema); 