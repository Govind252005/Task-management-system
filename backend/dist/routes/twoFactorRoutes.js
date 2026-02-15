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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_js_1 = require("../middleware/auth.js");
const twoFactorController = __importStar(require("../controllers/twoFactorController.js"));
const router = (0, express_1.Router)();
// Public routes (for login flow)
router.post('/send-login-otp', twoFactorController.sendLoginOTP);
router.post('/verify-login-otp', twoFactorController.verifyLoginOTP);
// Protected routes
router.use(auth_js_1.authenticate);
// Get 2FA status
router.get('/status', twoFactorController.get2FAStatus);
// Setup 2FA (sends verification code)
router.post('/setup', twoFactorController.setup2FA);
// Enable 2FA (verify and activate)
router.post('/enable', twoFactorController.enable2FA);
// Disable 2FA
router.post('/disable', twoFactorController.disable2FA);
// Regenerate backup codes
router.post('/regenerate-backup-codes', twoFactorController.regenerateBackupCodes);
// Trusted devices
router.get('/trusted-devices', twoFactorController.getTrustedDevices);
router.delete('/trusted-devices/:deviceId', twoFactorController.removeTrustedDevice);
exports.default = router;
//# sourceMappingURL=twoFactorRoutes.js.map