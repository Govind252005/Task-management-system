"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_js_1 = require("../controllers/authController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', authController_js_1.register);
router.post('/login', authController_js_1.login);
router.post('/forgot-password', authController_js_1.forgotPassword);
router.post('/reset-password', authController_js_1.resetPassword);
router.get('/verify-reset-token/:token', authController_js_1.verifyResetToken);
// Protected routes
router.get('/me', auth_js_1.authenticate, authController_js_1.getCurrentUser);
router.put('/me', auth_js_1.authenticate, authController_js_1.updateCurrentUser);
router.put('/change-password', auth_js_1.authenticate, authController_js_1.changePassword);
router.post('/refresh', auth_js_1.authenticate, authController_js_1.refreshToken);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map