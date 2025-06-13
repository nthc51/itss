// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const { User } = require('../models/models'); // Import User model

// Middleware to protect routes (ensure user is logged in)
const protect = async (req, res, next) => {
    let token;

    // Check for the presence of the Authorization header and if it starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token from the Authorization header
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using the JWT secret
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user by ID from the decoded token payload and attach to the request object
            // Exclude password from the user object
            req.user = await User.findById(decoded.id).select('-password');

            // If user is not found, return an error
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next(); // Proceed to the next middleware or route handler

        } catch (error) {
            console.error('Token verification failed:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    // If no token is provided in the request header
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Middleware to restrict access based on user role (optional, but good for admin routes)
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: `User role ${req.user ? req.user.role : 'unauthorized'} is not authorized to access this route` });
        }
        next();
    };
};

module.exports = { protect, authorizeRoles };