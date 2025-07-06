# EventsPark API

A simple RESTful API for event management with authentication and role-based access control (RBAC).

## Features

- **Authentication**: User registration and login with JWT tokens
- **RBAC**: Two user roles - `customer` and `organizer`
- **Event Management**: Create and retrieve events
- **Authorization**: Only organizers can create events, customers can view events

## User Roles

- **Customer**: Can view all events
- **Organizer**: Can create events and view all events

## API Endpoints

### Authentication

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "organizer"  // optional, defaults to "customer"
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Events

#### Get All Events
```
GET /api/events
GET /api/events?category=Concert
GET /api/events?date=2024-12-25
```

#### Get Single Event
```
GET /api/events/:id
```

#### Create Event (Organizer only)
```
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Summer Concert",
  "description": "An amazing summer concert",
  "date": "2024-08-15T19:00:00.000Z",
  "venue": "Central Park",
  "category": "Concert",
  "price": 50.00
}
```

## Event Categories

- Concert
- Sports
- Conference
- Workshop
- Theater
- Comedy
- Other

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file:
   ```
   MONGODB_URI=mongodb://localhost:27017/eventspark
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   NODE_ENV=development
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. For development with auto-restart:
   ```bash
   npm run dev
   ```

## Validation Rules

### Event Creation
- Title: 3-100 characters
- Description: 10-500 characters
- Date: Must be in the future
- Venue: Required
- Category: Must be one of the predefined categories
- Price: Must be a positive number

### User Registration
- Name: 2-50 characters
- Email: Valid email format
- Password: Minimum 6 characters
- Role: Either "customer" or "organizer" (defaults to "customer")

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error type",
  "message": "Human-readable error message"
}
```

## Authentication

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Health Check

```
GET /api/health
```

Returns server status and timestamp. 