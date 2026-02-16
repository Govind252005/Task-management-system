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
exports.OtpToken = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const twoFactorAuthSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    method: {
        type: String,
        enum: ['email'],
        default: 'email',
    },
    isEnabled: { type: Boolean, default: false },
    lastOtpSentAt: { type: Date },
    otpAttempts: { type: Number, default: 0 },
    otpLockedUntil: { type: Date },
    backupCodes: [
        {
            code: { type: String, required: true },
            isUsed: { type: Boolean, default: false },
            usedAt: { type: Date },
        },
    ],
    verifiedAt: { type: Date },
    requireOnLogin: { type: Boolean, default: true },
    requireOnSensitiveActions: { type: Boolean, default: true },
    trustedDevices: [
        {
            deviceId: { type: String, required: true },
            userAgent: { type: String },
            lastUsed: { type: Date, default: Date.now },
            expiresAt: { type: Date, required: true },
        },
    ],
}, { timestamps: true });
// Generate backup codes
twoFactorAuthSchema.methods.generateBackupCodes = function () {
    const codes = [];
    this.backupCodes = [];
    for (let i = 0; i < 10; i++) {
        const code = crypto_1.default.randomBytes(4).toString('hex').toUpperCase();
        const hashedCode = crypto_1.default.createHash('sha256').update(code).digest('hex');
        codes.push(code);
        this.backupCodes.push({ code: hashedCode, isUsed: false });
    }
    return codes;
};
// Validate backup code
twoFactorAuthSchema.methods.validateBackupCode = async function (code) {
    const hashedCode = crypto_1.default.createHash('sha256').update(code.toUpperCase()).digest('hex');
    const backupCode = this.backupCodes.find((bc) => bc.code === hashedCode && !bc.isUsed);
    if (!backupCode) {
        return false;
    }
    backupCode.isUsed = true;
    backupCode.usedAt = new Date();
    await this.save();
    return true;
};
// Static method to check if user has 2FA enabled
twoFactorAuthSchema.statics.isEnabled = async function (userId) {
    const twoFA = await this.findOne({ userId, isEnabled: true });
    return !!twoFA;
};
exports.default = mongoose_1.default.model('TwoFactorAuth', twoFactorAuthSchema);
const otpTokenSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true },
    type: {
        type: String,
        enum: ['login', 'sensitive_action', 'setup'],
        default: 'login',
    },
    expiresAt: { type: Date, required: true },
    isUsed: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
}, { timestamps: { createdAt: true, updatedAt: false } });
// TTL index - auto delete expired tokens
otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpTokenSchema.index({ userId: 1, type: 1 });
// Generate OTP
otpTokenSchema.statics.generateOTP = function () {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.OtpToken = mongoose_1.default.model('OtpToken', otpTokenSchema);
//# sourceMappingURL=TwoFactorAuth.js.map