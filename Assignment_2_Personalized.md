# Assignment 2: EventsPark API - Md Hasib Zaman (B01016875)

**GitHub Repository:** https://github.com/hsbzmn7/eventspark-api  
**Live API:** https://eventspark-api.onrender.com  
**Course:** CSCI5709 Advanced Web Development

## 1. Three Core Features Implemented

### ✅ Feature 1: Event Discovery & Calendar View
- Browse events with filtering by date, category, status
- Real-time availability updates
- Pagination support

### ✅ Feature 2: Seat Map Selection & Booking  
- Interactive seat map with availability status
- Real-time booking with conflict prevention
- Price tier integration (VIP, Premium, General, Student)

### ✅ Feature 3: E-Ticket Generation with QR Code
- Digital ticket generation upon booking
- QR code data for event entry validation
- Ticket status tracking

## 2. API Endpoints (Live Implementation)

### Event Discovery & Calendar View

#### GET /api/events
**Query Params:** page, limit, category, status, date  
**Response (200):**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "_id": "evt123",
        "title": "Summer Music Festival 2024",
        "date": "2024-07-15T18:00:00.000Z",
        "category": "Concert",
        "venue": {"name": "Central Park Arena"},
        "availableSeats": 120,
        "priceTiers": [
          {"tier": "VIP", "price": 150},
          {"tier": "General", "price": 75}
        ]
      }
    ],
    "pagination": {"currentPage": 1, "totalPages": 5}
  }
}
```

#### GET /api/events/:id
**Response (200):**
```json
{
  "success": true,
  "data": {
    "event": {
      "_id": "evt123",
      "title": "Summer Music Festival 2024",
      "description": "A fantastic summer music festival",
      "date": "2024-07-15T18:00:00.000Z",
      "venue": {"name": "Central Park Arena"},
      "seatMap": [...],
      "priceTiers": [...],
      "organizer": {...}
    }
  }
}
```

### Seat Map Selection & Booking

#### GET /api/events/:id/seats
**Response (200):**
```json
{
  "success": true,
  "data": {
    "eventId": "evt123",
    "availableSeats": [
      {
        "row": "A", "number": 1, "tier": "VIP",
        "price": 150, "isAvailable": true
      }
    ],
    "totalSeats": 100,
    "bookedSeats": 15
  }
}
```

#### POST /api/bookings
**Headers:** Authorization: Bearer <JWT_TOKEN>  
**Request Body:**
```json
{
  "eventId": "evt123",
  "seats": [
    {"row": "A", "number": 1, "tier": "VIP", "price": 150}
  ],
  "paymentMethod": "credit_card"
}
```
**Response (201):**
```json
{
  "success": true,
  "data": {
    "booking": {
      "_id": "bkg789",
      "totalAmount": 150,
      "status": "confirmed",
      "seats": [...]
    }
  }
}
```

### E-Ticket Generation with QR Code

#### POST /api/tickets/generate
**Headers:** Authorization: Bearer <JWT_TOKEN>  
**Request Body:**
```json
{
  "bookingId": "bkg789"
}
```
**Response (201):**
```json
{
  "success": true,
  "data": {
    "tickets": [
      {
        "_id": "tkt001",
        "ticketNumber": "TKT-20241201-12345",
        "qrCode": "data:image/png;base64,...",
        "seat": {"row": "A", "number": 1},
        "status": "active"
      }
    ]
  }
}
```

#### POST /api/tickets/validate
**Headers:** Authorization: Bearer <JWT_TOKEN>  
**Request Body:**
```json
{
  "qrCode": "data:image/png;base64,..."
}
```
**Response (200):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "ticket": {
      "ticketNumber": "TKT-20241201-12345",
      "eventId": "evt123",
      "seat": {"row": "A", "number": 1}
    }
  }
}
```

## 3. Security Implementation

### Authentication Endpoints

#### POST /api/auth/register
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "password123",
  "role": "user"
}
```

#### POST /api/auth/login
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET /api/auth/me
**Headers:** Authorization: Bearer <JWT_TOKEN>

### Security Features
- ✅ JWT Authentication with role-based access
- ✅ Password hashing with bcryptjs
- ✅ Input validation with express-validator
- ✅ SQL injection prevention via Mongoose
- ✅ Rate limiting and CORS enabled

## 4. Database Schema (MongoDB)

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (hashed),
  role: String (user/organizer/admin),
  isActive: Boolean
}
```

### Event Model  
```javascript
{
  title: String (required),
  description: String,
  date: Date (required),
  venue: {name, address, city, capacity},
  category: String,
  organizer: ObjectId (ref: User),
  priceTiers: [{tier, price, description}],
  seatMap: [{row, number, tier, isAvailable}],
  totalSeats: Number,
  availableSeats: Number,
  status: String
}
```

### Booking Model
```javascript
{
  user: ObjectId (ref: User),
  event: ObjectId (ref: Event), 
  seats: [{row, number, tier, price}],
  totalAmount: Number,
  status: String,
  paymentStatus: String,
  paymentMethod: String
}
```

### Ticket Model
```javascript
{
  booking: ObjectId (ref: Booking),
  user: ObjectId (ref: User),
  event: ObjectId (ref: Event),
  seat: {row, number, tier},
  ticketNumber: String (unique),
  qrCode: String,
  price: Number,
  status: String,
  validUntil: Date
}
```

## 5. Implementation & Deployment

### Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT
- **Validation:** Express-validator
- **Deployment:** Render

### Live Deployment
- **URL:** https://eventspark-api.onrender.com
- **Health Check:** https://eventspark-api.onrender.com/api/health
- **Status:** ✅ Active and functional

### Postman Collection
- **Automated Testing:** JWT token handling
- **Complete Workflow:** End-to-end testing
- **File:** `EventsPark_API_Postman_Collection_Automated.json`

## 6. Testing Results

### ✅ Successfully Tested
- User registration and authentication
- Event creation and management  
- Seat map retrieval and booking
- Ticket generation with QR codes
- Ticket validation for event entry
- Role-based access control
- Error handling and validation

### API Status
- **Total Endpoints:** 20+
- **Authentication:** ✅ Working
- **Database:** ✅ Connected
- **Deployment:** ✅ Live
- **Documentation:** ✅ Complete

## 7. Team Contributions

### My Role (Md Hasib Zaman - B01016875)
- ✅ Complete API architecture and design
- ✅ Database schema design and implementation
- ✅ Authentication and security system
- ✅ Event management system
- ✅ Seat booking system with conflict prevention
- ✅ E-ticket generation with QR codes
- ✅ Deployment and documentation
- ✅ Automated Postman collection

### Technical Achievements
- Complete RESTful API with 20+ endpoints
- JWT-based authentication with role-based access
- Real-time seat booking with conflict prevention
- E-ticket generation with QR code validation
- Production deployment on Render
- Comprehensive testing and documentation

---

**Repository:** https://github.com/hsbzmn7/eventspark-api  
**Live API:** https://eventspark-api.onrender.com  
**Status:** ✅ Assignment Complete 