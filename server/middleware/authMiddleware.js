const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};

const analyst = (req, res, next) => {
    // Admin can also do analyst things? Assuming yes, or strict separation.
    // Usually Admin > Analyst > Viewer.
    // Requirement says: Admin: Full access. Analyst: Upload and reconcile.
    if (req.user && (req.user.role === 'Analyst' || req.user.role === 'Admin')) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an analyst');
    }
};

module.exports = { protect, admin, analyst };
