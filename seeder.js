const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventspark', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const sampleUsers = [
    {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user'
    },
    {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'user'
    },
    {
        name: 'Event Organizer',
        email: 'organizer@example.com',
        password: 'password123',
        role: 'organizer'
    },
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
    }
];

const sampleEvents = [
    {
        title: 'Rock Concert 2025',
        description: 'An amazing rock concert featuring top artists from around the world. Get ready for an unforgettable night of music and entertainment.',
        date: new Date('2025-07-15T19:00:00Z'),
        venue: {
            name: 'Dalhousie Arena',
            address: '123 University Ave',
            city: 'Halifax',
            capacity: 100
        },
        category: 'Concert',
        priceTiers: [
            { tier: 'VIP', price: 150, description: 'Front row seats with meet & greet' },
            { tier: 'Premium', price: 100, description: 'Premium seating area' },
            { tier: 'General', price: 75, description: 'General admission' },
            { tier: 'Student', price: 50, description: 'Student discount' }
        ],
        status: 'published',
        imageUrl: 'https://example.com/rock-concert.jpg',
        tags: ['rock', 'music', 'concert']
    },
    {
        title: 'Tech Conference 2025',
        description: 'Join us for the biggest tech conference of the year. Learn from industry experts and network with professionals.',
        date: new Date('2025-07-20T09:00:00Z'),
        venue: {
            name: 'Convention Center',
            address: '456 Business St',
            city: 'Halifax',
            capacity: 200
        },
        category: 'Conference',
        priceTiers: [
            { tier: 'VIP', price: 300, description: 'All access pass with workshops' },
            { tier: 'Premium', price: 200, description: 'Conference access with lunch' },
            { tier: 'General', price: 150, description: 'Standard conference access' },
            { tier: 'Student', price: 75, description: 'Student conference pass' }
        ],
        status: 'published',
        imageUrl: 'https://example.com/tech-conference.jpg',
        tags: ['technology', 'conference', 'networking']
    },
    {
        title: 'Basketball Championship',
        description: 'Watch the final championship game between the top teams. Experience the excitement of live sports.',
        date: new Date('2025-07-25T18:00:00Z'),
        venue: {
            name: 'Sports Complex',
            address: '789 Sports Ave',
            city: 'Halifax',
            capacity: 150
        },
        category: 'Sports',
        priceTiers: [
            { tier: 'VIP', price: 120, description: 'Courtside seats' },
            { tier: 'Premium', price: 80, description: 'Premium seating' },
            { tier: 'General', price: 60, description: 'General admission' },
            { tier: 'Student', price: 40, description: 'Student tickets' }
        ],
        status: 'published',
        imageUrl: 'https://example.com/basketball.jpg',
        tags: ['sports', 'basketball', 'championship']
    }
];

const seedDatabase = async () => {
    try {
        console.log('Starting database seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Event.deleteMany({});
        console.log('Cleared existing data');

        // Create users
        const createdUsers = [];
        for (const userData of sampleUsers) {
            const user = await User.create(userData);
            createdUsers.push(user);
            console.log(`Created user: ${user.name} (${user.email})`);
        }

        // Create events
        const organizer = createdUsers.find(user => user.role === 'organizer');
        
        for (const eventData of sampleEvents) {
            // Generate seat map for each event
            const seatMap = [];
            const rows = Math.ceil(Math.sqrt(eventData.venue.capacity));
            const seatsPerRow = Math.ceil(eventData.venue.capacity / rows);
            
            let seatNumber = 1;
            for (let row = 0; row < rows && seatNumber <= eventData.venue.capacity; row++) {
                const rowLetter = String.fromCharCode(65 + row);
                for (let col = 1; col <= seatsPerRow && seatNumber <= eventData.venue.capacity; col++) {
                    let tier = 'General';
                    if (row < 2) tier = 'VIP';
                    else if (row < 4) tier = 'Premium';
                    
                    seatMap.push({
                        row: rowLetter,
                        number: col,
                        tier: tier,
                        isAvailable: true,
                        isBooked: false
                    });
                    seatNumber++;
                }
            }

            const event = await Event.create({
                ...eventData,
                organizer: organizer._id,
                seatMap,
                totalSeats: eventData.venue.capacity,
                availableSeats: eventData.venue.capacity
            });

            console.log(`Created event: ${event.title}`);
        }

        console.log('Database seeding completed successfully!');
        console.log('\nSample data created:');
        console.log(`- ${createdUsers.length} users`);
        console.log(`- ${sampleEvents.length} events`);
        console.log('\nYou can now test the API with these credentials:');
        console.log('User: john@example.com / password123');
        console.log('Organizer: organizer@example.com / password123');
        console.log('Admin: admin@example.com / password123');

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        mongoose.connection.close();
    }
};

// Run seeder if this file is executed directly
if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase; 