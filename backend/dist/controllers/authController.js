"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyResetToken = exports.resetPassword = exports.forgotPassword = exports.refreshToken = exports.changePassword = exports.updateCurrentUser = exports.getCurrentUser = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_js_1 = require("../models/User.js");
const index_js_1 = require("../config/index.js");
const Activity_js_1 = require("../models/Activity.js");
// Generate JWT token
const generateToken = (userId, role) => {
    return jsonwebtoken_1.default.sign({ userId, role }, index_js_1.config.jwt.secret, { expiresIn: index_js_1.config.jwt.expiresIn });
};
// Register new user
const register = async (req, res) => {
    try {
        const { name, email, password, role = 'employee', department = 'Engineering', domain, adminSecret } = req.body;
        const allowedRoles = ['admin', 'manager', 'team_lead', 'employee', 'viewer'];
        if (!allowedRoles.includes(role)) {
            res.status(400).json({ message: 'Invalid role' });
            return;
        }
        if (domain && !Object.values(User_js_1.UserDomain).includes(domain)) {
            res.status(400).json({ message: 'Invalid domain' });
            return;
        }
        // admin/manager gate: first admin/manager can self-bootstrap; afterwards require secret
        const isAdminLike = role === 'admin' || role === 'manager';
        if (isAdminLike) {
            const existingAdmins = await User_js_1.User.countDocuments({ role: { $in: ['admin', 'manager'] } });
            if (existingAdmins > 0) {
                if (!adminSecret || adminSecret !== process.env.ADMIN_SIGNUP_SECRET) {
                    res.status(403).json({ message: 'Admin/Manager signup requires a valid secret' });
                    return;
                }
            }
        }
        // Check if user already exists
        const existingUser = await User_js_1.User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists with this email' });
            return;
        }
        // Create new user
        const user = new User_js_1.User({
            name,
            email,
            password,
            role,
            department,
            domain: domain || undefined,
        });
        await user.save();
        const token = generateToken(user._id.toString(), user.role);
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                avatar: user.avatar,
            },
            token,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};
exports.register = register;
// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user and include password field
        const user = await User_js_1.User.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        if (!user.isActive) {
            res.status(401).json({ message: 'Account is deactivated. Please contact admin.' });
            return;
        }
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        const token = generateToken(user._id.toString(), user.role);
        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                avatar: user.avatar,
                emailNotifications: user.emailNotifications,
            },
            token,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};
exports.login = login;
// Get current user
const getCurrentUser = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'Not authenticated' });
            return;
        }
        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                avatar: user.avatar,
                activeTasks: user.activeTasks,
                capacity: user.capacity,
                emailNotifications: user.emailNotifications,
                managerId: user.managerId,
                teamMembers: user.teamMembers,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error getting user', error: error.message });
    }
};
exports.getCurrentUser = getCurrentUser;
// Update current user
const updateCurrentUser = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { name, avatar, emailNotifications, capacity } = req.body;
        const user = await User_js_1.User.findByIdAndUpdate(userId, { name, avatar, emailNotifications, capacity }, { new: true, runValidators: true });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        try {
            await Activity_js_1.Activity.create({
                userId,
                action: 'updated profile',
                target: 'profile',
                targetType: 'user',
                targetId: user._id,
                metadata: { emailNotifications, capacity, name: user.name },
            });
        }
        catch (err) {
            console.error('Failed to record profile activity', err);
        }
        res.json({
            message: 'User updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                avatar: user.avatar,
                emailNotifications: user.emailNotifications,
                capacity: user.capacity,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};
exports.updateCurrentUser = updateCurrentUser;
// Change password
const changePassword = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { currentPassword, newPassword } = req.body;
        const user = await User_js_1.User.findById(userId).select('+password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            res.status(400).json({ message: 'Current password is incorrect' });
            return;
        }
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error changing password', error: error.message });
    }
};
exports.changePassword = changePassword;
// Refresh token
const refreshToken = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: 'Not authenticated' });
            return;
        }
        const token = generateToken(user._id.toString(), user.role);
        res.json({
            message: 'Token refreshed',
            token,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error refreshing token', error: error.message });
    }
};
exports.refreshToken = refreshToken;
// Request password reset
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const { PasswordReset } = await import('../models/PasswordReset.js');
        const { sendPasswordResetEmail } = await import('../services/emailService.js');
        const user = await User_js_1.User.findOne({ email, isActive: true });
        // Always return success to prevent email enumeration
        if (!user) {
            res.json({ message: 'If an account exists with this email, you will receive a password reset link' });
            return;
        }
        // Generate reset token
        const crypto = await import('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        // Save reset token to database
        await PasswordReset.create({
            userId: user._id,
            token: resetToken,
            expiresAt,
        });
        // Send email
        const resetUrl = `${index_js_1.config.urls.frontend}/reset-password?token=${resetToken}`;
        await sendPasswordResetEmail(user.email, user.name, resetUrl);
        res.json({ message: 'If an account exists with this email, you will receive a password reset link' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error processing password reset request', error: error.message });
    }
};
exports.forgotPassword = forgotPassword;
// Reset password with token
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const { PasswordReset } = await import('../models/PasswordReset.js');
        if (!token || !newPassword) {
            res.status(400).json({ message: 'Token and new password are required' });
            return;
        }
        if (newPassword.length < 6) {
            res.status(400).json({ message: 'Password must be at least 6 characters' });
            return;
        }
        // Find valid reset token
        const resetRequest = await PasswordReset.findOne({
            token,
            used: false,
            expiresAt: { $gt: new Date() },
        });
        if (!resetRequest) {
            res.status(400).json({ message: 'Invalid or expired reset token' });
            return;
        }
        // Update user password
        const user = await User_js_1.User.findById(resetRequest.userId).select('+password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        user.password = newPassword;
        await user.save();
        // Mark token as used
        resetRequest.used = true;
        await resetRequest.save();
        res.json({ message: 'Password reset successfully. You can now login with your new password.' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
};
exports.resetPassword = resetPassword;
// Verify reset token
const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;
        const { PasswordReset } = await import('../models/PasswordReset.js');
        const resetRequest = await PasswordReset.findOne({
            token,
            used: false,
            expiresAt: { $gt: new Date() },
        });
        if (!resetRequest) {
            res.status(400).json({ valid: false, message: 'Invalid or expired reset token' });
            return;
        }
        res.json({ valid: true, message: 'Token is valid' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error verifying token', error: error.message });
    }
};
exports.verifyResetToken = verifyResetToken;
//# sourceMappingURL=authController.js.map