const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ error: 'User not found' });
            }

            if (!req.user.isActive) {
                return res.status(401).json({ error: 'User account is deactivated' });
            }

            next();
        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({ error: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ error: 'Not authorized, no token' });
    }
};

// Authorize roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authorized, no user' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'Not authorized to access this route',
                requiredRoles: roles,
                userRole: req.user.role
            });
        }

        next();
    };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            // Token is invalid, but we don't fail the request
            console.log('Optional auth: Invalid token');
        }
    }

    next();
};

module.exports = {
    protect,
    authorize,
    optionalAuth
}; 