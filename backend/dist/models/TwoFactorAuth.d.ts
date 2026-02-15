import mongoose, { Document } from 'mongoose';
export interface ITwoFactorAuth extends Document {
    userId: mongoose.Types.ObjectId;
    method: 'email';
    isEnabled: boolean;
    lastOtpSentAt?: Date;
    otpAttempts: number;
    otpLockedUntil?: Date;
    backupCodes: {
        code: string;
        isUsed: boolean;
        usedAt?: Date;
    }[];
    verifiedAt?: Date;
    requireOnLogin: boolean;
    requireOnSensitiveActions: boolean;
    trustedDevices: {
        deviceId: string;
        userAgent: string;
        lastUsed: Date;
        expiresAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
    generateBackupCodes(): string[];
    validateBackupCode(code: string): Promise<boolean>;
}
declare const _default: mongoose.Model<ITwoFactorAuth, {}, {}, {}, mongoose.Document<unknown, {}, ITwoFactorAuth, {}, {}> & ITwoFactorAuth & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
export interface IOtpToken extends Document {
    userId: mongoose.Types.ObjectId;
    token: string;
    type: 'login' | 'sensitive_action' | 'setup';
    expiresAt: Date;
    isUsed: boolean;
    attempts: number;
    createdAt: Date;
}
export declare const OtpToken: mongoose.Model<IOtpToken, {}, {}, {}, mongoose.Document<unknown, {}, IOtpToken, {}, {}> & IOtpToken & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=TwoFactorAuth.d.ts.map