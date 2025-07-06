const { validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array().map(error => ({
                field: error.path,
                message: error.msg,
                value: error.value
            }))
        });
    }
    
    next();
};

// Sanitize and validate user input
const sanitizeInput = (req, res, next) => {
    // Remove any potential script tags or dangerous content
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key]
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .trim();
            }
        });
    }
    
    next();
};

// Rate limiting helper (basic implementation)
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const requests = new Map();
    
    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        if (!requests.has(ip)) {
            requests.set(ip, { count: 1, resetTime: now + windowMs });
        } else {
            const userRequests = requests.get(ip);
            
            if (now > userRequests.resetTime) {
                userRequests.count = 1;
                userRequests.resetTime = now + windowMs;
            } else {
                userRequests.count++;
            }
            
            if (userRequests.count > maxRequests) {
                return res.status(429).json({
                    error: 'Too many requests',
                    message: 'Rate limit exceeded. Please try again later.'
                });
            }
        }
        
        next();
    };
};

module.exports = {
    handleValidationErrors,
    sanitizeInput,
    rateLimit
}; 