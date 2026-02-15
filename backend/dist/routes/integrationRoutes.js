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
const integrationController = __importStar(require("../controllers/integrationController.js"));
const router = (0, express_1.Router)();
// OAuth callbacks (no auth required - use state token)
router.get('/github/callback', integrationController.githubCallback);
router.get('/google/callback', integrationController.googleCallback);
// All other routes require authentication
router.use(auth_js_1.authenticate);
// Get all integrations
router.get('/', integrationController.getIntegrations);
// GitHub
router.get('/github/connect', integrationController.connectGitHub);
router.get('/github/repos', integrationController.getGitHubRepos);
router.post('/github/link-repo', integrationController.linkGitHubRepo);
// Google Calendar
router.get('/google/connect', integrationController.connectGoogleCalendar);
router.get('/google/calendars', integrationController.getGoogleCalendars);
// Slack
router.get('/slack/channels', integrationController.getSlackChannels);
// General integration management
router.patch('/:integrationId', integrationController.updateIntegration);
router.delete('/:integrationId', integrationController.disconnectIntegration);
router.post('/:integrationId/test', integrationController.testIntegration);
exports.default = router;
//# sourceMappingURL=integrationRoutes.js.map