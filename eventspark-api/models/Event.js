const mongoose = require('mongoose');

const priceTierSchema = new mongoose.Schema({
    tier: {
        type: String,
        required: true,
        enum: ['VIP', 'Premium', 'General', 'Student']
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    description: String
});

const seatSchema = new mongoose.Schema({
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
    isAvailable: {
        type: Boolean,
        default: true
    },
    isBooked: {
        type: Boolean,
        default: false
    }
});

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Event description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    date: {
        type: Date,
        required: [true, 'Event date is required'],
        validate: {
            validator: function(v) {
                return v > new Date();
            },
            message: 'Event date must be in the future'
        }
    },
    venue: {
        name: {
            type: String,
            required: [true, 'Venue name is required']
        },
        address: {
            type: String,
            required: [true, 'Venue address is required']
        },
        city: {
            type: String,
            required: [true, 'City is required']
        },
        capacity: {
            type: Number,
            required: [true, 'Venue capacity is required'],
            min: [1, 'Capacity must be at least 1']
        }
    },
    category: {
        type: String,
        required: [true, 'Event category is required'],
        enum: ['Concert', 'Sports', 'Conference', 'Workshop', 'Theater', 'Comedy', 'Other']
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Organizer is required']
    },
    priceTiers: [priceTierSchema],
    seatMap: [seatSchema],
    totalSeats: {
        type: Number,
        required: true
    },
    availableSeats: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'cancelled', 'completed'],
        default: 'draft'
    },
    imageUrl: String,
    tags: [String]
}, {
    timestamps: true
});

// Calculate available seats before saving
eventSchema.pre('save', function(next) {
    if (this.seatMap && this.seatMap.length > 0) {
        this.totalSeats = this.seatMap.length;
        this.availableSeats = this.seatMap.filter(seat => seat.isAvailable && !seat.isBooked).length;
    }
    next();
});

// Virtual for checking if event is sold out
eventSchema.virtual('isSoldOut').get(function() {
    return this.availableSeats === 0;
});

// Index for better query performance
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ organizer: 1 });

module.exports = mongoose.model('Event', eventSchema); 