"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamLeadAndAbove = exports.managerAndAbove = exports.adminOnly = exports.authorizeResourceAccess = exports.authorizeMinRole = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_js_1 = require("../config/index.js");
const User_js_1 = require("../models/User.js");
// Verify JWT token
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Access denied. No token provided.' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, index_js_1.config.jwt.secret);
        const user = await User_js_1.User.findById(decoded.userId);
        if (!user || !user.isActive) {
            res.status(401).json({ message: 'Invalid token or user not found.' });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ message: 'Token expired.' });
            return;
        }
        res.status(401).json({ message: 'Invalid token.' });
    }
};
exports.authenticate = authenticate;
// Check if user has required role
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required.' });
            return;
        }
        const userRole = req.user.role;
        if (!allowedRoles.includes(userRole)) {
            res.status(403).json({
                message: 'Access denied. Insufficient permissions.',
                requiredRoles: allowedRoles,
                userRole: userRole
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
// Check if user has minimum role level
const authorizeMinRole = (minRole) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required.' });
            return;
        }
        const userRole = req.user.role;
        const userLevel = index_js_1.ROLE_HIERARCHY[userRole];
        const requiredLevel = index_js_1.ROLE_HIERARCHY[minRole];
        if (userLevel < requiredLevel) {
            res.status(403).json({
                message: 'Access denied. Insufficient permissions.',
                requiredMinRole: minRole,
                userRole: userRole
            });
            return;
        }
        next();
    };
};
exports.authorizeMinRole = authorizeMinRole;
// Check if user can access resource (own data or has permission)
const authorizeResourceAccess = (resourceUserIdField = 'userId') => {
    return async (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required.' });
            return;
        }
        const userRole = req.user.role;
        const userId = req.user._id.toString();
        const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
        // Admins and managers can access all resources
        if (index_js_1.ROLE_HIERARCHY[userRole] >= index_js_1.ROLE_HIERARCHY.manager) {
            next();
            return;
        }
        // Team leads can access their team members' resources
        if (userRole === 'team_lead') {
            const teamMember = await User_js_1.User.findById(resourceUserId);
            if (teamMember && teamMember.managerId?.toString() === userId) {
                next();
                return;
            }
        }
        // Users can only access their own resources
        if (resourceUserId === userId) {
            next();
            return;
        }
        res.status(403).json({ message: 'Access denied. You can only access your own resources.' });
    };
};
exports.authorizeResourceAccess = authorizeResourceAccess;
// Admin only middleware
exports.adminOnly = (0, exports.authorize)('admin');
// Manager and above middleware
exports.managerAndAbove = (0, exports.authorizeMinRole)('manager');
// Team lead and above middleware
exports.teamLeadAndAbove = (0, exports.authorizeMinRole)('team_lead');
//# sourceMappingURL=auth.js.map