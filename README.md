# EventsPark API

A RESTful API for the EventsPark Event Booking & Ticketing Web Application. This API provides endpoints for event management, seat booking, ticket generation, and user authentication.

## Features

- **Event Management**: Create, read, update, and delete events
- **Seat Map Selection**: Interactive seat booking with real-time availability
- **E-Ticket Generation**: Digital tickets with QR codes for event entry
- **User Authentication**: JWT-based authentication with role-based access control
- **Booking System**: Complete booking workflow with payment integration
- **Security**: Input validation, rate limiting, and SQL injection prevention

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express-validator
- **Security**: bcryptjs for password hashing

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd eventspark-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eventspark
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/reset-password` - Request password reset
- `GET /api/auth/me` - Get current user profile

### Events
- `GET /api/events` - Get all events with filtering
- `GET /api/events/:id` - Get specific event details
- `GET /api/events/:id/seats` - Get seat map for an event
- `POST /api/events` - Create a new event (Organizer only)

### Bookings
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings` - Get user's bookings

### Tickets
- `POST /api/tickets/validate` - Validate ticket for event entry
- `GET /api/tickets/user/:userId` - Get user's tickets
- `GET /api/tickets/:ticketId` - Get specific ticket details

## Core Features Implementation

### 1. Event Discovery & Calendar View
- Filter events by date and category
- Pagination support
- Real-time availability updates

### 2. Seat Map Selection & Booking
- Interactive seat map with availability status
- Real-time seat booking with conflict prevention
- Price tier integration

### 3. E-Ticket Generation with QR Code
- Digital ticket generation upon booking
- QR code data for event entry validation
- Ticket status tracking (active, used, expired)

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: User, Organizer, and Admin roles
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries with Mongoose
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: Basic rate limiting implementation

## Database Schema

### User
- Basic user information (name, email, password)
- Role-based access (user, organizer, admin)
- Account status and password reset functionality

### Event
- Event details (title, description, date, venue)
- Seat map with availability tracking
- Price tiers and capacity management

### Booking
- User bookings with seat selections
- Payment status and booking reference
- Cancellation support

### Ticket
- Digital tickets with QR codes
- Validity period and usage tracking
- Event entry validation

## Testing

The API can be tested using Postman or any REST client. Sample requests and responses are documented in the API documentation.

## Deployment

The API is designed to be deployed on platforms like:
- Render
- Heroku
- AWS
- Railway

## Environment Variables

- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `NODE_ENV`: Environment (development/production)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the CSCI5709 Advanced Web Development course at Dalhousie University.

## Team

- **Md Hasib Zaman** (B01016875) - Backend Development Lead
- **Shray Moza** (B00987463) - Frontend Development
- **Imran Khan** (B00980496) - Authentication & Profile Management
- **Mency Maheshkumar Christian** (B01021841) - Email & QR Code Functionality
- **Abhay Lohani** (B00989230) - Payment Integration & Admin Dashboard 