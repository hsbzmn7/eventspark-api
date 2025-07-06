# Assignment 2: EventsPark API Documentation
**Course:** CSCI5709 Advanced Web Development  
**Student:** Md Hasib Zaman (B01016875)  
**Date:** December 2024

## Table of Contents
1. [Project Overview](#project-overview)
2. [API Design & Architecture](#api-design--architecture)
3. [Database Schema](#database-schema)
4. [API Endpoints Documentation](#api-endpoints-documentation)
5. [Authentication & Security](#authentication--security)
6. [Core Features Implementation](#core-features-implementation)
7. [Testing Strategy](#testing-strategy)
8. [Deployment](#deployment)
9. [Postman Collection](#postman-collection)
10. [Team Contributions](#team-contributions)

---

## Project Overview

### Project Name: EventsPark
**Description:** A comprehensive event booking and ticketing web application that allows users to discover events, book seats, and manage digital tickets with QR codes.

### Key Features
- **Event Discovery**: Browse and search events with calendar view
- **Seat Map Selection**: Interactive seat booking with real-time availability
- **Dynamic Pricing**: Multiple price tiers (VIP, Premium, General, Student)
- **E-Ticket Generation**: Digital tickets with QR codes for event entry
- **Email Notifications**: Automated email confirmations and reminders
- **Payment Integration**: Secure payment processing
- **Role-Based Access**: User, Organizer, and Admin roles

### Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express-validator
- **Security**: bcryptjs for password hashing
- **Deployment**: Render (Cloud Platform)

---

## API Design & Architecture

### RESTful API Principles
The API follows RESTful design principles:
- **Stateless**: Each request contains all necessary information
- **Resource-based URLs**: Clear, hierarchical URL structure
- **HTTP Methods**: Proper use of GET, POST, PUT, DELETE
- **Status Codes**: Appropriate HTTP status codes for responses
- **JSON Responses**: Consistent JSON response format

### API Base URL
```
https://eventspark-api.onrender.com
```

### Response Format
All API responses follow a consistent format:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2024-12-XX..."
}
```

### Error Handling
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description",
  "timestamp": "2024-12-XX..."
}
```

---

## Database Schema

### 1. User Model
```javascript
{
  name: String (required, max 50 chars),
  email: String (required, unique, validated),
  password: String (required, min 6 chars, hashed),
  role: String (enum: 'user', 'organizer', 'admin'),
  phone: String (optional),
  isActive: Boolean (default: true),
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  timestamps: true
}
```

### 2. Event Model
```javascript
{
  title: String (required, max 100 chars),
  description: String (required, max 1000 chars),
  date: Date (required, future date),
  venue: {
    name: String (required),
    address: String (required),
    city: String (required),
    capacity: Number (required, min 1)
  },
  category: String (enum: categories),
  organizer: ObjectId (ref: User),
  priceTiers: [{
    tier: String (VIP, Premium, General, Student),
    price: Number (required, min 0),
    description: String
  }],
  seatMap: [{
    row: String (required),
    number: Number (required),
    tier: String (required),
    isAvailable: Boolean (default: true),
    isBooked: Boolean (default: false)
  }],
  totalSeats: Number (required),
  availableSeats: Number (required),
  status: String (enum: draft, published, cancelled, completed),
  imageUrl: String,
  tags: [String],
  timestamps: true
}
```

### 3. Booking Model
```javascript
{
  user: ObjectId (ref: User, required),
  event: ObjectId (ref: Event, required),
  seats: [{
    row: String (required),
    number: Number (required),
    tier: String (required),
    price: Number (required)
  }],
  totalAmount: Number (required, min 0),
  status: String (enum: pending, confirmed, cancelled, refunded),
  paymentStatus: String (enum: pending, paid, failed, refunded),
  paymentMethod: String (enum: payment methods),
  paymentIntentId: String,
  bookingDate: Date (default: now),
  specialRequests: String (max 500 chars),
  cancellationReason: String,
  refundAmount: Number (default: 0),
  timestamps: true
}
```

### 4. Ticket Model
```javascript
{
  booking: ObjectId (ref: Booking, required),
  user: ObjectId (ref: User, required),
  event: ObjectId (ref: Event, required),
  seat: {
    row: String (required),
    number: Number (required),
    tier: String (required)
  },
  ticketNumber: String (required, unique),
  qrCode: String (required),
  price: Number (required, min 0),
  status: String (enum: active, used, cancelled, expired),
  issuedAt: Date (default: now),
  usedAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  validUntil: Date (required),
  timestamps: true
}
```

---

## API Endpoints Documentation

### Authentication Endpoints

#### 1. Register User
```
POST /api/auth/register
```
**Description:** Register a new user account
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```
**Response:** 201 Created
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

#### 2. Login User
```
POST /api/auth/login
```
**Description:** Authenticate user and return JWT token
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:** 200 OK
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

#### 3. Get Current User
```
GET /api/auth/me
```
**Headers:** Authorization: Bearer {token}
**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

### Event Endpoints

#### 1. Get All Events
```
GET /api/events?page=1&limit=10&category=Concert&status=published
```
**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `category`: Filter by category
- `status`: Filter by status
- `date`: Filter by date range

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "events": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50
    }
  }
}
```

#### 2. Get Event by ID
```
GET /api/events/:id
```
**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "event": { ... }
  }
}
```

#### 3. Create Event (Organizer)
```
POST /api/events
```
**Headers:** Authorization: Bearer {token}
**Request Body:**
```json
{
  "title": "Summer Music Festival",
  "description": "Amazing summer music event",
  "date": "2024-07-15T18:00:00.000Z",
  "venue": {
    "name": "Central Park",
    "address": "123 Main St",
    "city": "New York",
    "capacity": 1000
  },
  "category": "Concert",
  "priceTiers": [...],
  "seatMap": [...]
}
```

#### 4. Get Available Seats
```
GET /api/events/:id/seats
```
**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "availableSeats": [...],
    "totalSeats": 100,
    "bookedSeats": 25
  }
}
```

### Booking Endpoints

#### 1. Create Booking
```
POST /api/bookings
```
**Headers:** Authorization: Bearer {token}
**Request Body:**
```json
{
  "eventId": "event_id_here",
  "seats": [
    {
      "row": "A",
      "number": 1,
      "tier": "VIP",
      "price": 150
    }
  ],
  "paymentMethod": "credit_card"
}
```

#### 2. Get User Bookings
```
GET /api/bookings/my-bookings
```
**Headers:** Authorization: Bearer {token}
**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "bookings": [...],
    "pagination": { ... }
  }
}
```

### Ticket Endpoints

#### 1. Generate Tickets
```
POST /api/tickets/generate
```
**Headers:** Authorization: Bearer {token}
**Request Body:**
```json
{
  "bookingId": "booking_id_here"
}
```

#### 2. Validate Ticket
```
POST /api/tickets/validate
```
**Headers:** Authorization: Bearer {token}
**Request Body:**
```json
{
  "qrCode": "qr_code_data_here"
}
```

#### 3. Get User Tickets
```
GET /api/tickets/my-tickets
```
**Headers:** Authorization: Bearer {token}
**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "tickets": [...]
  }
}
```

---

## Authentication & Security

### JWT Implementation
- **Token Structure:** Header.Payload.Signature
- **Secret Key:** Environment variable `JWT_SECRET`
- **Expiration:** 24 hours (configurable)
- **Refresh Strategy:** Re-login required after expiration

### Password Security
- **Hashing:** bcryptjs with salt rounds of 10
- **Validation:** Minimum 6 characters required
- **Storage:** Hashed passwords only, never plain text

### Role-Based Access Control
1. **User Role:**
   - Browse events
   - Book seats
   - Manage own bookings
   - View own tickets

2. **Organizer Role:**
   - All user permissions
   - Create events
   - Manage own events
   - View event analytics

3. **Admin Role:**
   - All permissions
   - Manage all events
   - View all bookings
   - System administration

### Input Validation
- **Express-validator** for request validation
- **MongoDB injection prevention** via Mongoose
- **Data sanitization** for all inputs
- **Rate limiting** to prevent abuse

---

## Core Features Implementation

### 1. Event Discovery & Calendar View
**Implementation:**
- Filter events by date range, category, and status
- Pagination support for large datasets
- Real-time availability updates
- Search functionality by title and description

**API Endpoints:**
- `GET /api/events` with query parameters
- Date range filtering
- Category-based filtering

### 2. Seat Map Selection & Booking
**Implementation:**
- Interactive seat map with availability status
- Real-time booking with conflict prevention
- Price tier integration
- Seat selection validation

**API Endpoints:**
- `GET /api/events/:id/seats` - Get available seats
- `POST /api/bookings` - Create booking with seat selection

### 3. Dynamic Pricing
**Implementation:**
- Multiple price tiers (VIP, Premium, General, Student)
- Tier-based seat allocation
- Dynamic pricing based on demand
- Discount management

### 4. E-Ticket Generation with QR Codes
**Implementation:**
- Unique ticket number generation
- QR code generation with ticket data
- Digital ticket storage
- Validity period management

**API Endpoints:**
- `POST /api/tickets/generate` - Generate tickets
- `POST /api/tickets/validate` - Validate QR codes

### 5. Email Notifications
**Implementation:**
- Booking confirmation emails
- Ticket delivery emails
- Event reminder notifications
- Cancellation notifications

### 6. Payment Integration
**Implementation:**
- Multiple payment methods support
- Payment status tracking
- Refund processing
- Payment security

---

## Testing Strategy

### 1. Unit Testing
- Individual function testing
- Model validation testing
- Middleware testing

### 2. Integration Testing
- API endpoint testing
- Database integration testing
- Authentication flow testing

### 3. Postman Collection
**Automated Testing Features:**
- JWT token automatic extraction
- Response data extraction to variables
- Automated workflow testing
- Complete user journey testing

**Collection Structure:**
- Health Check
- Authentication Flow
- Event Management
- Booking Management
- Ticket Management
- Complete Workflow

### 4. Test Scenarios
1. **User Registration & Login**
2. **Event Creation & Management**
3. **Seat Booking Process**
4. **Ticket Generation & Validation**
5. **Payment Processing**
6. **Error Handling**

---

## Deployment

### Platform: Render
**Deployment URL:** https://eventspark-api.onrender.com

### Environment Variables
```env
PORT=10000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
NODE_ENV=production
```

### Deployment Process
1. **Code Repository:** GitHub
2. **Build Command:** `npm install`
3. **Start Command:** `npm start`
4. **Root Directory:** `eventspark-api`

### Monitoring
- **Health Check:** `/api/health`
- **Logs:** Render dashboard
- **Performance:** Response time monitoring

---

## Postman Collection

### Collection Features
- **Automated JWT handling**
- **Response data extraction**
- **Complete workflow testing**
- **Environment variables**

### Import Instructions
1. Download `EventsPark_API_Postman_Collection_Automated.json`
2. Import into Postman
3. Set environment variables
4. Run automated tests

### Test Workflow
1. Health Check
2. User Registration
3. User Login
4. Event Creation
5. Seat Booking
6. Ticket Generation
7. Ticket Validation

---

## Team Contributions

### Team Members
1. **Md Hasib Zaman (B01016875)** - Backend Development Lead
2. **Shray Moza (B00987463)** - Frontend Development
3. **Imran Khan (B00980496)** - Authentication & Profile Management
4. **Mency Maheshkumar Christian (B01021841)** - Email & QR Code Functionality
5. **Abhay Lohani (B00989230)** - Payment Integration & Admin Dashboard

### My Contributions (Md Hasib Zaman)
- **API Architecture Design**
- **Database Schema Design**
- **Authentication System**
- **Event Management System**
- **Booking System**
- **Ticket Management**
- **Security Implementation**
- **Deployment & Documentation**
- **Postman Collection Creation**

### Technical Achievements
- ✅ Complete RESTful API implementation
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ Real-time seat booking
- ✅ E-ticket generation with QR codes
- ✅ Comprehensive error handling
- ✅ Automated testing with Postman
- ✅ Production deployment on Render
- ✅ Complete API documentation

---

## Conclusion

The EventsPark API successfully implements all required features for a modern event booking and ticketing system. The API follows RESTful principles, implements proper security measures, and provides comprehensive functionality for event management, booking, and ticket generation.

**Key Achievements:**
- Complete API implementation with 20+ endpoints
- Secure authentication and authorization
- Real-time seat booking system
- E-ticket generation with QR codes
- Comprehensive testing and documentation
- Production-ready deployment

**Future Enhancements:**
- Real-time notifications (WebSocket)
- Advanced analytics dashboard
- Mobile app API endpoints
- Payment gateway integration
- Advanced search and filtering

---

**Repository:** https://github.com/hsbzmn7/eventspark-api  
**Live API:** https://eventspark-api.onrender.com  
**Documentation:** Complete API documentation with Postman collection 