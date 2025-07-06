const express = require('express');
const { body, query } = require('express-validator');
const Event = require('../models/Event');
const { handleValidationErrors, sanitizeInput } = require('../middleware/validate');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ... existing code ... 