const mongoose = require('mongoose');

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
        maxlength: [500, 'Description cannot exceed 500 characters']
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
        type: String,
        required: [true, 'Venue is required'],
        trim: true
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
    price: {
        type: Number,
        required: [true, 'Event price is required'],
        min: [0, 'Price cannot be negative']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', eventSchema); 