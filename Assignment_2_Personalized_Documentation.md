# Assignment 2: EventsPark API - Personalized Documentation
**Course:** CSCI5709 Advanced Web Development  
**Student:** Md Hasib Zaman (B01016875)  
**Date:** December 2024  
**GitHub Repository:** https://github.com/hsbzmn7/eventspark-api  
**Live API:** https://eventspark-api.onrender.com

## 1. Selecting Three Core Features

Based on my EventsPark proposal, I have implemented three strong, central features:

### ✅ **Feature 1: Event Discovery & Calendar View**
- Browse events with filtering by date, category, and status
- Real-time availability updates
- Pagination support for large datasets
- Search functionality by title and description

### ✅ **Feature 2: Seat Map Selection & Booking**
- Interactive seat map with availability status
- Real-time booking with conflict prevention
- Price tier integration (VIP, Premium, General, Student)
- Seat selection validation

### ✅ **Feature 3: E-Ticket Generation with QR Code**
- Digital ticket generation upon booking
- QR code data for event entry validation
- Ticket status tracking (active, used, expired)
- Unique ticket number generation

---

## 2. API Endpoint Definitions

### Feature 1: Event Discovery & Calendar View

#### a) List Events by Date/Category
```
GET /api/events
```

**Query Parameters:**
- `page` (optional, number) - Page number for pagination
- `limit` (optional, number) - Items per page (default: 10)
- `category` (optional, string) - Filter by event category
- `status` (optional, string) - Filter by event status
- `date` (optional, ISO string) - Filter by date

**Response (200 Success):**
```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "data": {
    "events": [
      {
        "_id": "evt123",
        "title": "Summer Music Festival 2024",
        "description": "A fantastic summer music festival",
        "date": "2024-07-15T18:00:00.000Z",
        "category": "Concert",
        "venue": {
          "name": "Central Park Arena",
          "address": "123 Main Street",
          "city": "New York",
          "capacity": 5000
        },
        "availableSeats": 120,
        "priceTiers": [
          {"tier": "VIP", "price": 150, "description": "Premium seating"},
          {"tier": "General", "price": 75, "description": "Standard seating"}
        ],
        "status": "published",
        "organizer": {
          "_id": "org456",
          "name": "Event Organizer"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid query parameters
- `500`: Server error

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid date format",
  "message": "Please provide a valid date in ISO format"
}
```

#### b) Get Event Details
```
GET /api/events/:id
```

**Response (200 Success):**
```json
{
  "success": true,
  "data": {
    "event": {
      "_id": "evt123",
      "title": "Summer Music Festival 2024",
      "description": "A fantastic summer music festival featuring top artists",
      "date": "2024-07-15T18:00:00.000Z",
      "venue": {
        "name": "Central Park Arena",
        "address": "123 Main Street",
        "city": "New York",
        "capacity": 5000
      },
      "category": "Concert",
      "seatMap": [
        {
          "row": "A",
          "number": 1,
          "tier": "VIP",
          "isAvailable": true,
          "isBooked": false
        }
      ],
      "priceTiers": [
        {"tier": "VIP", "price": 150, "description": "Premium seating"},
        {"tier": "General", "price": 75, "description": "Standard seating"}
      ],
      "totalSeats": 100,
      "availableSeats": 85,
      "status": "published",
      "organizer": {
        "_id": "org456",
        "name": "Event Organizer"
      },
      "imageUrl": "https://example.com/event-image.jpg",
      "tags": ["music", "summer", "festival"]
    }
  }
}
```

**Status Codes:**
- `200`: Success
- `404`: Event not found
- `500`: Server error

**Error Response (404):**
```json
{
  "success": false,
  "error": "Event not found",
  "message": "No event found with the provided ID"
}
```

---

### Feature 2: Seat Map Selection & Booking

#### a) Get Seat Map for Event
```
GET /api/events/:id/seats
```

**Response (200 Success):**
```json
{
  "success": true,
  "data": {
    "eventId": "evt123",
    "eventTitle": "Summer Music Festival 2024",
    "availableSeats": [
      {
        "row": "A",
        "number": 1,
        "tier": "VIP",
        "price": 150,
        "isAvailable": true,
        "isBooked": false
      },
      {
        "row": "A",
        "number": 2,
        "tier": "VIP",
        "price": 150,
        "isAvailable": false,
        "isBooked": true
      },
      {
        "row": "B",
        "number": 1,
        "tier": "General",
        "price": 75,
        "isAvailable": true,
        "isBooked": false
      }
    ],
    "totalSeats": 100,
    "bookedSeats": 15,
    "availableCount": 85
  }
}
```

**Status Codes:**
- `200`: Success
- `404`: Event not found
- `500`: Server error

#### b) Book Seats
```
POST /api/bookings
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "eventId": "evt123",
  "seats": [
    {
      "row": "A",
      "number": 1,
      "tier": "VIP",
      "price": 150
    },
    {
      "row": "B",
      "number": 1,
      "tier": "General",
      "price": 75
    }
  ],
  "paymentMethod": "credit_card",
  "specialRequests": "Please provide wheelchair access"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking": {
      "_id": "bkg789",
      "user": {
        "_id": "usr456",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "event": {
        "_id": "evt123",
        "title": "Summer Music Festival 2024"
      },
      "seats": [
        {
          "row": "A",
          "number": 1,
          "tier": "VIP",
          "price": 150
        },
        {
          "row": "B",
          "number": 1,
          "tier": "General",
          "price": 75
        }
      ],
      "totalAmount": 225,
      "status": "confirmed",
      "paymentStatus": "paid",
      "paymentMethod": "credit_card",
      "bookingDate": "2024-12-XX...",
      "specialRequests": "Please provide wheelchair access"
    }
  }
}
```

**Status Codes:**
- `201`: Booking created successfully
- `400`: Invalid request data
- `409`: Seat already booked
- `402`: Payment required
- `401`: Unauthorized
- `500`: Server error

**Error Response (409):**
```json
{
  "success": false,
  "error": "Seat already booked",
  "message": "One or more selected seats are no longer available"
}
```

**Error Response (402):**
```json
{
  "success": false,
  "error": "Payment failed",
  "message": "Payment processing failed. Please try again."
}
```

---

### Feature 3: E-Ticket Generation with QR Code

#### a) Generate Tickets for Booking
```
POST /api/tickets/generate
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "bookingId": "bkg789"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Tickets generated successfully",
  "data": {
    "tickets": [
      {
        "_id": "tkt001",
        "booking": "bkg789",
        "user": {
          "_id": "usr456",
          "name": "John Doe"
        },
        "event": {
          "_id": "evt123",
          "title": "Summer Music Festival 2024",
          "date": "2024-07-15T18:00:00.000Z"
        },
        "seat": {
          "row": "A",
          "number": 1,
          "tier": "VIP"
        },
        "ticketNumber": "TKT-20241201-12345",
        "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
        "price": 150,
        "status": "active",
        "issuedAt": "2024-12-XX...",
        "validUntil": "2024-07-16T18:00:00.000Z"
      },
      {
        "_id": "tkt002",
        "booking": "bkg789",
        "user": {
          "_id": "usr456",
          "name": "John Doe"
        },
        "event": {
          "_id": "evt123",
          "title": "Summer Music Festival 2024",
          "date": "2024-07-15T18:00:00.000Z"
        },
        "seat": {
          "row": "B",
          "number": 1,
          "tier": "General"
        },
        "ticketNumber": "TKT-20241201-12346",
        "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
        "price": 75,
        "status": "active",
        "issuedAt": "2024-12-XX...",
        "validUntil": "2024-07-16T18:00:00.000Z"
      }
    ]
  }
}
```

#### b) Get User Tickets
```
GET /api/tickets/my-tickets
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 Success):**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "_id": "tkt001",
        "eventId": "evt123",
        "eventTitle": "Summer Music Festival 2024",
        "eventDate": "2024-07-15T18:00:00.000Z",
        "seat": {
          "row": "A",
          "number": 1,
          "tier": "VIP"
        },
        "ticketNumber": "TKT-20241201-12345",
        "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
        "price": 150,
        "status": "active",
        "issuedAt": "2024-12-XX...",
        "validUntil": "2024-07-16T18:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1
    }
  }
}
```

#### c) Validate Ticket (for event entry)
```
POST /api/tickets/validate
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Response (200 Success):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "ticket": {
      "_id": "tkt001",
      "ticketNumber": "TKT-20241201-12345",
      "eventId": "evt123",
      "eventTitle": "Summer Music Festival 2024",
      "seat": {
        "row": "A",
        "number": 1,
        "tier": "VIP"
      },
      "status": "active",
      "validUntil": "2024-07-16T18:00:00.000Z"
    }
  }
}
```

**Status Codes:**
- `200`: Valid ticket
- `400`: Invalid ticket
- `410`: Ticket already used
- `401`: Unauthorized
- `500`: Server error

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid ticket",
  "message": "The provided QR code is not valid"
}
```

**Error Response (410):**
```json
{
  "success": false,
  "error": "Ticket already used",
  "message": "This ticket has already been used for entry"
}
```

---

## 3. Security-Related Endpoints

### a) User Registration
```
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "usr456",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "user",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Status Codes:**
- `201`: User created successfully
- `400`: Email already exists
- `422`: Validation error

### b) User Login
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response (200 Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "usr456",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Status Codes:**
- `200`: Login successful
- `401`: Invalid credentials
- `422`: Validation error

### c) Get Current User Profile
```
GET /api/auth/me
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 Success):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "usr456",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "user",
      "phone": "+1234567890",
      "isActive": true
    }
  }
}
```

### d) Update User Profile
```
PUT /api/auth/profile
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+1234567890"
}
```

### e) Change Password
```
PUT /api/auth/change-password
```

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

### f) Role-Based Access Control (RBAC)

**Admin Endpoints:**
```
GET /api/admin/users - List all users (Admin only)
GET /api/admin/events - List all events (Admin only)
GET /api/admin/bookings - List all bookings (Admin only)
```

**Organizer Endpoints:**
```
POST /api/events - Create event (Organizer/Admin only)
PUT /api/events/:id - Update event (Organizer/Admin only)
DELETE /api/events/:id - Delete event (Organizer/Admin only)
GET /api/events/organizer/my-events - Get organizer's events
```

**Security Mitigation:**
- ✅ **Input Validation**: All endpoints use express-validator to prevent injection attacks
- ✅ **JWT Authentication**: Secure token-based authentication with role checking
- ✅ **Password Hashing**: bcryptjs with salt rounds of 10 for secure password storage
- ✅ **Rate Limiting**: Basic rate limiting to prevent abuse
- ✅ **CORS**: Enabled for cross-origin requests
- ✅ **SQL Injection Prevention**: Mongoose ODM prevents NoSQL injection
- ✅ **Authorization**: Role-based access control for sensitive endpoints

---

## 4. Data Integration & ERD

### Database Schema (MongoDB with Mongoose)

#### User Entity
```javascript
{
  _id: ObjectId,
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

#### Event Entity
```javascript
{
  _id: ObjectId,
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

#### Booking Entity
```javascript
{
  _id: ObjectId,
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

#### Ticket Entity
```javascript
{
  _id: ObjectId,
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

### ERD (Entity Relationship Diagram)
```
User (1) --- (M) Booking (M) --- (1) Event
Booking (1) --- (M) Ticket
Event (1) --- (M) Ticket

Relationships:
• User can have many Bookings
• Booking belongs to one User and one Event
• Booking can have many Tickets (one per seat)
• Event has many Tickets
• Ticket belongs to one Booking, one User, and one Event
```

### CRUD Mapping
- **User**: Register, login, update profile (`/api/auth/*`)
- **Event**: Create, read, update, delete (`/api/events/*`)
- **Booking**: Create, read, cancel (`/api/bookings/*`)
- **Ticket**: Generate, read, validate (`/api/tickets/*`)

---

## 5. Implementation Plan

### ✅ **Successfully Implemented Features**

I have successfully implemented the **Seat Map Selection & Booking** feature as the core functionality, along with comprehensive event management and e-ticket generation.

### **Tech Stack Used:**
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express-validator
- **Security**: bcryptjs for password hashing
- **Deployment**: Render (Cloud Platform)

### **Key Implementations:**

#### 1. Seat Map Selection & Booking
- ✅ `GET /api/events/:id/seats` - Fetch seat map with availability
- ✅ `POST /api/bookings` - Book seats with real-time validation
- ✅ Real-time seat availability tracking
- ✅ Conflict prevention for concurrent bookings
- ✅ Price tier integration

#### 2. Event Management
- ✅ `GET /api/events` - List events with filtering and pagination
- ✅ `GET /api/events/:id` - Get detailed event information
- ✅ `POST /api/events` - Create new events (Organizer role)
- ✅ `PUT /api/events/:id` - Update events
- ✅ `DELETE /api/events/:id` - Delete events

#### 3. E-Ticket Generation
- ✅ `POST /api/tickets/generate` - Generate digital tickets
- ✅ `GET /api/tickets/my-tickets` - Get user tickets
- ✅ `POST /api/tickets/validate` - Validate QR codes
- ✅ Unique ticket number generation
- ✅ QR code generation for each ticket

### **Deployment:**
- ✅ **Platform**: Render (Cloud Platform)
- ✅ **Live URL**: https://eventspark-api.onrender.com
- ✅ **Repository**: https://github.com/hsbzmn7/eventspark-api
- ✅ **Health Check**: `/api/health` endpoint

### **Demonstration:**
- ✅ **Live API**: Fully functional and accessible
- ✅ **Postman Collection**: Automated testing collection with JWT handling
- ✅ **Database**: MongoDB Atlas with real data
- ✅ **Documentation**: Complete API documentation

### **Testing Results:**
- ✅ All endpoints tested and working
- ✅ Authentication flow verified
- ✅ Seat booking with conflict prevention
- ✅ E-ticket generation and validation
- ✅ Role-based access control
- ✅ Error handling and validation

---

## 6. Postman Collection & Testing

### **Automated Postman Collection Features:**
- ✅ **JWT Token Automation**: Automatic extraction and usage
- ✅ **Response Data Extraction**: IDs and data saved to variables
- ✅ **Complete Workflow Testing**: End-to-end user journey
- ✅ **Error Case Testing**: Comprehensive error scenarios
- ✅ **Environment Variables**: Dynamic data management

### **Collection Structure:**
1. **Health Check** - Verify API status
2. **Authentication Flow** - Register, login, profile management
3. **Event Management** - Create, read, update events
4. **Seat Booking** - Get seats, create bookings
5. **Ticket Management** - Generate and validate tickets
6. **Complete Workflow** - Full user journey test

### **Test Scenarios Covered:**
- ✅ User registration and authentication
- ✅ Event creation and management
- ✅ Seat map retrieval and booking
- ✅ Ticket generation with QR codes
- ✅ Ticket validation for event entry
- ✅ Error handling and edge cases
- ✅ Role-based access control

---

## 7. Security Implementation

### **Authentication & Authorization:**
- ✅ **JWT Implementation**: Secure token-based authentication
- ✅ **Password Security**: bcryptjs hashing with salt
- ✅ **Role-Based Access**: User, Organizer, Admin roles
- ✅ **Input Validation**: Express-validator for all inputs
- ✅ **SQL Injection Prevention**: Mongoose ODM protection

### **API Security:**
- ✅ **Rate Limiting**: Basic rate limiting implementation
- ✅ **CORS**: Cross-origin resource sharing enabled
- ✅ **Error Handling**: Secure error messages
- ✅ **Request Validation**: Comprehensive input validation
- ✅ **Token Expiration**: JWT token expiration handling

---

## 8. Conclusion

### **Project Achievements:**
- ✅ **Complete API Implementation**: 20+ endpoints with full CRUD operations
- ✅ **Live Deployment**: Successfully deployed on Render
- ✅ **Comprehensive Testing**: Automated Postman collection
- ✅ **Security Implementation**: JWT authentication and role-based access
- ✅ **Database Design**: Proper MongoDB schema with relationships
- ✅ **Documentation**: Complete API documentation

### **Technical Highlights:**
- **Real-time Seat Booking**: Conflict prevention and availability tracking
- **E-Ticket Generation**: Digital tickets with QR codes
- **Role-Based Access**: Secure authentication and authorization
- **Automated Testing**: Comprehensive Postman collection
- **Production Ready**: Live deployment with monitoring

### **Repository & Links:**
- **GitHub Repository**: https://github.com/hsbzmn7/eventspark-api
- **Live API**: https://eventspark-api.onrender.com
- **Health Check**: https://eventspark-api.onrender.com/api/health
- **Postman Collection**: `EventsPark_API_Postman_Collection_Automated.json`

### **Future Enhancements:**
- Real-time notifications (WebSocket)
- Advanced analytics dashboard
- Payment gateway integration
- Mobile app API endpoints
- Advanced search and filtering

---

**Student:** Md Hasib Zaman (B01016875)  
**Course:** CSCI5709 Advanced Web Development  
**Assignment:** EventsPark API Implementation  
**Status:** ✅ Complete and Deployed 