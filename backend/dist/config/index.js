"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEPARTMENTS = exports.ROLE_HIERARCHY = exports.ROLES = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/loom_project',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'default-secret-change-me',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    email: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        from: process.env.EMAIL_FROM || 'noreply@loom-project.com',
    },
    urls: {
        frontend: process.env.FRONTEND_URL || 'http://localhost:5173',
        admin: process.env.ADMIN_URL || 'http://localhost:5174',
    },
    // AI Configuration
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
    // OAuth - GitHub
    github: {
        clientId: process.env.GITHUB_CLIENT_ID || '',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
        callbackUrl: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/integrations/github/callback',
    },
    // OAuth - Google
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/integrations/google/callback',
    },
    // Slack Integration
    slack: {
        botToken: process.env.SLACK_BOT_TOKEN || '',
        signingSecret: process.env.SLACK_SIGNING_SECRET || '',
        clientId: process.env.SLACK_CLIENT_ID || '',
        clientSecret: process.env.SLACK_CLIENT_SECRET || '',
    },
    // Rate Limiting
    rateLimiting: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    },
    // 2FA Settings
    twoFactor: {
        otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '10'),
        maxOtpAttempts: parseInt(process.env.MAX_OTP_ATTEMPTS || '5'),
        lockoutMinutes: parseInt(process.env.LOCKOUT_MINUTES || '30'),
    },
};
exports.ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    TEAM_LEAD: 'team_lead',
    EMPLOYEE: 'employee',
    VIEWER: 'viewer',
};
exports.ROLE_HIERARCHY = {
    admin: 5,
    manager: 4,
    team_lead: 3,
    employee: 2,
    viewer: 1,
};
exports.DEPARTMENTS = [
    'Engineering',
    'Design',
    'Marketing',
    'Sales',
    'HR',
    'Finance',
    'Operations',
];
//# sourceMappingURL=index.js.map