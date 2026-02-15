"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrustedDevices = exports.removeTrustedDevice = exports.regenerateBackupCodes = exports.verifyLoginOTP = exports.sendLoginOTP = exports.disable2FA = exports.enable2FA = exports.setup2FA = exports.get2FAStatus = void 0;
const TwoFactorAuth_js_1 = __importStar(require("../models/TwoFactorAuth.js"));
const User_js_1 = require("../models/User.js");
const AuditLog_js_1 = __importDefault(require("../models/AuditLog.js"));
const emailService_js_1 = __importDefault(require("../services/emailService.js"));
const index_js_1 = require("../config/index.js");
const crypto_1 = __importDefault(require("crypto"));
// Get 2FA status for current user
const get2FAStatus = async (req, res) => {
    try {
        const user = req.user;
        const twoFA = await TwoFactorAuth_js_1.default.findOne({ userId: user._id });
        if (!twoFA) {
            return res.json({
                isEnabled: false,
                method: null,
                hasBackupCodes: false,
            });
        }
        res.json({
            isEnabled: twoFA.isEnabled,
            method: twoFA.method,
            hasBackupCodes: twoFA.backupCodes.filter((bc) => !bc.isUsed).length > 0,
            backupCodesRemaining: twoFA.backupCodes.filter((bc) => !bc.isUsed).length,
            trustedDevicesCount: twoFA.trustedDevices.length,
        });
    }
    catch (error) {
        console.error('Get 2FA status error:', error);
        res.status(500).json({ message: 'Failed to get 2FA status' });
    }
};
exports.get2FAStatus = get2FAStatus;
// Initialize 2FA setup
const setup2FA = async (req, res) => {
    try {
        const user = req.user;
        const existingTwoFA = await TwoFactorAuth_js_1.default.findOne({ userId: user._id });
        if (existingTwoFA && existingTwoFA.isEnabled) {
            return res.status(400).json({ message: '2FA is already enabled' });
        }
        // Generate and send OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Delete any existing setup tokens
        await TwoFactorAuth_js_1.OtpToken.deleteMany({ userId: user._id, type: 'setup' });
        // Create new OTP token
        const otpToken = new TwoFactorAuth_js_1.OtpToken({
            userId: user._id,
            token: crypto_1.default.createHash('sha256').update(otp).digest('hex'),
            type: 'setup',
            expiresAt: new Date(Date.now() + index_js_1.config.twoFactor.otpExpiryMinutes * 60 * 1000),
        });
        await otpToken.save();
        // Send OTP email
        await emailService_js_1.default.sendEmail({
            to: user.email,
            subject: 'Your 2FA Setup Code',
            html: `
        <h2>Two-Factor Authentication Setup</h2>
        <p>Your verification code is:</p>
        <h1 style="font-size: 32px; letter-spacing: 8px; text-align: center; background: #f0f0f0; padding: 20px; border-radius: 8px;">${otp}</h1>
        <p>This code will expire in ${index_js_1.config.twoFactor.otpExpiryMinutes} minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
        });
        res.json({
            message: 'Verification code sent to your email',
            expiresIn: index_js_1.config.twoFactor.otpExpiryMinutes * 60,
        });
    }
    catch (error) {
        console.error('Setup 2FA error:', error);
        res.status(500).json({ message: 'Failed to setup 2FA' });
    }
};
exports.setup2FA = setup2FA;
// Verify and enable 2FA
const enable2FA = async (req, res) => {
    try {
        const user = req.user;
        const { otp, code } = req.body;
        const otpValue = otp || code; // Accept both 'otp' and 'code'
        if (!otpValue) {
            return res.status(400).json({ message: 'Verification code is required' });
        }
        const hashedOtp = crypto_1.default.createHash('sha256').update(otpValue).digest('hex');
        const otpToken = await TwoFactorAuth_js_1.OtpToken.findOne({
            userId: user._id,
            type: 'setup',
            token: hashedOtp,
            isUsed: false,
        });
        if (!otpToken) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }
        if (otpToken.expiresAt < new Date()) {
            await otpToken.deleteOne();
            return res.status(400).json({ message: 'Code has expired' });
        }
        // Mark OTP as used
        otpToken.isUsed = true;
        await otpToken.save();
        // Create or update 2FA settings
        let twoFA = await TwoFactorAuth_js_1.default.findOne({ userId: user._id });
        if (!twoFA) {
            twoFA = new TwoFactorAuth_js_1.default({
                userId: user._id,
                method: 'email',
            });
        }
        // Generate backup codes
        const backupCodes = twoFA.generateBackupCodes();
        twoFA.isEnabled = true;
        twoFA.verifiedAt = new Date();
        await twoFA.save();
        // Log the action
        await AuditLog_js_1.default.create({
            userId: user._id,
            action: '2fa_enabled',
            entityType: 'user',
            entityId: user._id,
            severity: 'info',
        });
        res.json({
            message: '2FA has been enabled',
            backupCodes, // Show these only once!
            warning: 'Save these backup codes in a safe place. You won\'t be able to see them again.',
        });
    }
    catch (error) {
        console.error('Enable 2FA error:', error);
        res.status(500).json({ message: 'Failed to enable 2FA' });
    }
};
exports.enable2FA = enable2FA;
// Disable 2FA
const disable2FA = async (req, res) => {
    try {
        const user = req.user;
        const { otp, code, backupCode } = req.body;
        const otpValue = otp || code; // Accept both 'otp' and 'code'
        const twoFA = await TwoFactorAuth_js_1.default.findOne({ userId: user._id });
        if (!twoFA || !twoFA.isEnabled) {
            return res.status(400).json({ message: '2FA is not enabled' });
        }
        // Verify with OTP or backup code
        let verified = false;
        if (otpValue) {
            const hashedOtp = crypto_1.default.createHash('sha256').update(otpValue).digest('hex');
            const otpToken = await TwoFactorAuth_js_1.OtpToken.findOne({
                userId: user._id,
                token: hashedOtp,
                isUsed: false,
                expiresAt: { $gt: new Date() },
            });
            if (otpToken) {
                otpToken.isUsed = true;
                await otpToken.save();
                verified = true;
            }
        }
        else if (backupCode) {
            verified = await twoFA.validateBackupCode(backupCode);
        }
        if (!verified) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }
        twoFA.isEnabled = false;
        twoFA.backupCodes = [];
        twoFA.trustedDevices = [];
        await twoFA.save();
        // Log the action
        await AuditLog_js_1.default.create({
            userId: user._id,
            action: '2fa_disabled',
            entityType: 'user',
            entityId: user._id,
            severity: 'warning',
        });
        res.json({ message: '2FA has been disabled' });
    }
    catch (error) {
        console.error('Disable 2FA error:', error);
        res.status(500).json({ message: 'Failed to disable 2FA' });
    }
};
exports.disable2FA = disable2FA;
// Send OTP for login
const sendLoginOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User_js_1.User.findOne({ email });
        if (!user) {
            // Don't reveal if user exists
            return res.json({ message: 'If an account exists, a code has been sent' });
        }
        const twoFA = await TwoFactorAuth_js_1.default.findOne({ userId: user._id, isEnabled: true });
        if (!twoFA) {
            return res.json({ message: 'If an account exists, a code has been sent', requires2FA: false });
        }
        // Check if locked out
        if (twoFA.otpLockedUntil && twoFA.otpLockedUntil > new Date()) {
            const minutesLeft = Math.ceil((twoFA.otpLockedUntil.getTime() - Date.now()) / (1000 * 60));
            return res.status(429).json({
                message: `Too many attempts. Please try again in ${minutesLeft} minutes`,
            });
        }
        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Delete old login tokens
        await TwoFactorAuth_js_1.OtpToken.deleteMany({ userId: user._id, type: 'login' });
        // Create new token
        const otpToken = new TwoFactorAuth_js_1.OtpToken({
            userId: user._id,
            token: crypto_1.default.createHash('sha256').update(otp).digest('hex'),
            type: 'login',
            expiresAt: new Date(Date.now() + index_js_1.config.twoFactor.otpExpiryMinutes * 60 * 1000),
        });
        await otpToken.save();
        // Update last OTP sent time
        twoFA.lastOtpSentAt = new Date();
        await twoFA.save();
        // Send email
        await emailService_js_1.default.sendEmail({
            to: user.email,
            subject: 'Your Login Code',
            html: `
        <h2>Login Verification</h2>
        <p>Your verification code is:</p>
        <h1 style="font-size: 32px; letter-spacing: 8px; text-align: center; background: #f0f0f0; padding: 20px; border-radius: 8px;">${otp}</h1>
        <p>This code will expire in ${index_js_1.config.twoFactor.otpExpiryMinutes} minutes.</p>
        <p>If you didn't try to log in, please secure your account immediately.</p>
      `,
        });
        res.json({
            message: 'Verification code sent',
            requires2FA: true,
            expiresIn: index_js_1.config.twoFactor.otpExpiryMinutes * 60,
        });
    }
    catch (error) {
        console.error('Send login OTP error:', error);
        res.status(500).json({ message: 'Failed to send verification code' });
    }
};
exports.sendLoginOTP = sendLoginOTP;
// Verify login OTP
const verifyLoginOTP = async (req, res) => {
    try {
        const { email, otp, backupCode, trustDevice, userAgent } = req.body;
        const user = await User_js_1.User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const twoFA = await TwoFactorAuth_js_1.default.findOne({ userId: user._id, isEnabled: true });
        if (!twoFA) {
            return res.status(400).json({ message: '2FA is not enabled for this account' });
        }
        // Check lockout
        if (twoFA.otpLockedUntil && twoFA.otpLockedUntil > new Date()) {
            return res.status(429).json({ message: 'Account temporarily locked' });
        }
        let verified = false;
        if (otp) {
            const hashedOtp = crypto_1.default.createHash('sha256').update(otp).digest('hex');
            const otpToken = await TwoFactorAuth_js_1.OtpToken.findOne({
                userId: user._id,
                type: 'login',
                token: hashedOtp,
                isUsed: false,
            });
            if (otpToken && otpToken.expiresAt > new Date()) {
                otpToken.isUsed = true;
                await otpToken.save();
                verified = true;
                twoFA.otpAttempts = 0;
            }
            else {
                // Increment attempts
                twoFA.otpAttempts += 1;
                if (twoFA.otpAttempts >= index_js_1.config.twoFactor.maxOtpAttempts) {
                    twoFA.otpLockedUntil = new Date(Date.now() + index_js_1.config.twoFactor.lockoutMinutes * 60 * 1000);
                }
                await twoFA.save();
            }
        }
        else if (backupCode) {
            verified = await twoFA.validateBackupCode(backupCode);
            if (verified) {
                twoFA.otpAttempts = 0;
                await twoFA.save();
            }
        }
        if (!verified) {
            return res.status(401).json({
                message: 'Invalid verification code',
                attemptsRemaining: Math.max(0, index_js_1.config.twoFactor.maxOtpAttempts - twoFA.otpAttempts),
            });
        }
        // Trust device if requested
        if (trustDevice) {
            const deviceId = crypto_1.default.randomBytes(32).toString('hex');
            twoFA.trustedDevices.push({
                deviceId,
                userAgent: userAgent || 'Unknown',
                lastUsed: new Date(),
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            });
            await twoFA.save();
            return res.json({
                verified: true,
                message: '2FA verified successfully',
                trustedDeviceId: deviceId,
            });
        }
        res.json({
            verified: true,
            message: '2FA verified successfully',
        });
    }
    catch (error) {
        console.error('Verify login OTP error:', error);
        res.status(500).json({ message: 'Verification failed' });
    }
};
exports.verifyLoginOTP = verifyLoginOTP;
// Regenerate backup codes
const regenerateBackupCodes = async (req, res) => {
    try {
        const user = req.user;
        const { otp } = req.body;
        const twoFA = await TwoFactorAuth_js_1.default.findOne({ userId: user._id, isEnabled: true });
        if (!twoFA) {
            return res.status(400).json({ message: '2FA is not enabled' });
        }
        // Verify with OTP
        const hashedOtp = crypto_1.default.createHash('sha256').update(otp).digest('hex');
        const otpToken = await TwoFactorAuth_js_1.OtpToken.findOne({
            userId: user._id,
            token: hashedOtp,
            isUsed: false,
            expiresAt: { $gt: new Date() },
        });
        if (!otpToken) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }
        otpToken.isUsed = true;
        await otpToken.save();
        // Generate new backup codes
        const backupCodes = twoFA.generateBackupCodes();
        await twoFA.save();
        res.json({
            backupCodes,
            warning: 'Save these backup codes in a safe place. Previous codes are no longer valid.',
        });
    }
    catch (error) {
        console.error('Regenerate backup codes error:', error);
        res.status(500).json({ message: 'Failed to regenerate backup codes' });
    }
};
exports.regenerateBackupCodes = regenerateBackupCodes;
// Remove trusted device
const removeTrustedDevice = async (req, res) => {
    try {
        const user = req.user;
        const { deviceId } = req.params;
        const twoFA = await TwoFactorAuth_js_1.default.findOne({ userId: user._id });
        if (!twoFA) {
            return res.status(404).json({ message: '2FA settings not found' });
        }
        twoFA.trustedDevices = twoFA.trustedDevices.filter((d) => d.deviceId !== deviceId);
        await twoFA.save();
        res.json({ message: 'Device removed from trusted list' });
    }
    catch (error) {
        console.error('Remove trusted device error:', error);
        res.status(500).json({ message: 'Failed to remove device' });
    }
};
exports.removeTrustedDevice = removeTrustedDevice;
// Get trusted devices
const getTrustedDevices = async (req, res) => {
    try {
        const user = req.user;
        const twoFA = await TwoFactorAuth_js_1.default.findOne({ userId: user._id });
        if (!twoFA) {
            return res.json({ devices: [] });
        }
        // Filter out expired devices
        const activeDevices = twoFA.trustedDevices.filter((d) => d.expiresAt > new Date());
        res.json({
            devices: activeDevices.map((d) => ({
                deviceId: d.deviceId,
                userAgent: d.userAgent,
                lastUsed: d.lastUsed,
                expiresAt: d.expiresAt,
            })),
        });
    }
    catch (error) {
        console.error('Get trusted devices error:', error);
        res.status(500).json({ message: 'Failed to get trusted devices' });
    }
};
exports.getTrustedDevices = getTrustedDevices;
//# sourceMappingURL=twoFactorController.js.map