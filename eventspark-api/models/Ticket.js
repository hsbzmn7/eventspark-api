const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: [true, 'Booking reference is required']
    },
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
    seat: {
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
        }
    },
    ticketNumber: {
        type: String,
        required: true,
        unique: true
    },
    qrCode: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: [true, 'Ticket price is required'],
        min: [0, 'Price cannot be negative']
    },
    status: {
        type: String,
        enum: ['active', 'used', 'cancelled', 'expired'],
        default: 'active'
    },
    issuedAt: {
        type: Date,
        default: Date.now
    },
    usedAt: Date,
    cancelledAt: Date,
    cancellationReason: String,
    validUntil: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

// Generate ticket number before saving
ticketSchema.pre('save', function(next) {
    if (!this.ticketNumber) {
        // Generate unique ticket number: TKT-YYYYMMDD-XXXXX
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        this.ticketNumber = `TKT-${date}-${random}`;
    }
    
    // Set valid until date to event date + 1 day
    if (!this.validUntil && this.event) {
        // This will be set when the ticket is populated with event data
    }
    
    next();
});

// Virtual for checking if ticket is valid
ticketSchema.virtual('isValid').get(function() {
    return this.status === 'active' && new Date() <= this.validUntil;
});

// Virtual for checking if ticket is expired
ticketSchema.virtual('isExpired').get(function() {
    return new Date() > this.validUntil;
});

// Index for better query performance
ticketSchema.index({ ticketNumber: 1 });
ticketSchema.index({ user: 1, status: 1 });
ticketSchema.index({ event: 1, status: 1 });
ticketSchema.index({ booking: 1 });
ticketSchema.index({ qrCode: 1 });
ticketSchema.index({ status: 1, validUntil: 1 });

module.exports = mongoose.model('Ticket', ticketSchema); 