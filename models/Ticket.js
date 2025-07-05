const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    ticketNumber: {
        type: String,
        unique: true,
        required: true
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: [true, 'Booking reference is required']
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: [true, 'Event reference is required']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required']
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
    price: {
        type: Number,
        required: true
    },
    qrCode: {
        data: {
            type: String,
            required: true
        },
        imageUrl: String
    },
    status: {
        type: String,
        enum: ['active', 'used', 'cancelled', 'expired'],
        default: 'active'
    },
    usedAt: {
        type: Date
    },
    usedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    validFrom: {
        type: Date,
        default: Date.now
    },
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
        this.ticketNumber = 'TK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
    next();
});

// Generate QR code data before saving
ticketSchema.pre('save', function(next) {
    if (!this.qrCode.data) {
        this.qrCode.data = JSON.stringify({
            ticketId: this._id,
            ticketNumber: this.ticketNumber,
            eventId: this.event,
            userId: this.user,
            seat: this.seat
        });
    }
    next();
});

// Set validity period based on event date
ticketSchema.pre('save', function(next) {
    if (!this.validUntil && this.event) {
        // Ticket is valid until 2 hours after event start time
        // This will be set when the ticket is created with event data
    }
    next();
});

// Virtual for checking if ticket is valid
ticketSchema.virtual('isValid').get(function() {
    const now = new Date();
    return this.status === 'active' && 
           now >= this.validFrom && 
           now <= this.validUntil;
});

// Virtual for checking if ticket is expired
ticketSchema.virtual('isExpired').get(function() {
    return new Date() > this.validUntil;
});

// Index for better query performance
ticketSchema.index({ ticketNumber: 1 });
ticketSchema.index({ booking: 1 });
ticketSchema.index({ event: 1 });
ticketSchema.index({ user: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ 'qrCode.data': 1 });

module.exports = mongoose.model('Ticket', ticketSchema); 