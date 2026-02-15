"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testIntegration = exports.disconnectIntegration = exports.updateIntegration = exports.getSlackChannels = exports.getGoogleCalendars = exports.googleCallback = exports.connectGoogleCalendar = exports.linkGitHubRepo = exports.getGitHubRepos = exports.githubCallback = exports.connectGitHub = exports.getIntegrations = void 0;
const Integration_js_1 = __importDefault(require("../models/Integration.js"));
const AuditLog_js_1 = __importDefault(require("../models/AuditLog.js"));
const githubService_js_1 = __importDefault(require("../services/githubService.js"));
const googleCalendarService_js_1 = __importDefault(require("../services/googleCalendarService.js"));
const slackService_js_1 = __importDefault(require("../services/slackService.js"));
const index_js_1 = require("../config/index.js");
const crypto_1 = __importDefault(require("crypto"));
// Store OAuth state tokens temporarily (in production, use Redis)
const oauthStates = new Map();
// Clean up old states periodically
setInterval(() => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    for (const [key, value] of oauthStates.entries()) {
        if (value.timestamp < fiveMinutesAgo) {
            oauthStates.delete(key);
        }
    }
}, 60 * 1000);
// Get all integrations for current user
const getIntegrations = async (req, res) => {
    try {
        const user = req.user;
        const integrations = await Integration_js_1.default.find({ userId: user._id }).select('-accessToken -refreshToken');
        const integrationsWithStatus = integrations.map((int) => ({
            id: int._id,
            type: int.type,
            status: int.status,
            isActive: int.isActive,
            lastSyncAt: int.lastSyncAt,
            config: {
                slack: int.slackConfig
                    ? {
                        teamName: int.slackConfig.teamName,
                        channelName: int.slackConfig.channelName,
                        notifyOnTaskCreated: int.slackConfig.notifyOnTaskCreated,
                        notifyOnTaskCompleted: int.slackConfig.notifyOnTaskCompleted,
                        notifyOnMention: int.slackConfig.notifyOnMention,
                        notifyOnComment: int.slackConfig.notifyOnComment,
                        notifyOnDueDate: int.slackConfig.notifyOnDueDate,
                    }
                    : undefined,
                github: int.githubConfig
                    ? {
                        accountLogin: int.githubConfig.accountLogin,
                        linkedRepositories: int.githubConfig.linkedRepositories.length,
                        linkCommitsToTasks: int.githubConfig.linkCommitsToTasks,
                        linkPRsToTasks: int.githubConfig.linkPRsToTasks,
                    }
                    : undefined,
                googleCalendar: int.googleCalendarConfig
                    ? {
                        calendarName: int.googleCalendarConfig.calendarName,
                        syncTasksDueDates: int.googleCalendarConfig.syncTasksDueDates,
                        syncSprintDates: int.googleCalendarConfig.syncSprintDates,
                    }
                    : undefined,
            },
        }));
        res.json(integrationsWithStatus);
    }
    catch (error) {
        console.error('Get integrations error:', error);
        res.status(500).json({ message: 'Failed to get integrations' });
    }
};
exports.getIntegrations = getIntegrations;
// --- GitHub Integration ---
// Start GitHub OAuth flow
const connectGitHub = async (req, res) => {
    try {
        const user = req.user;
        const state = crypto_1.default.randomBytes(16).toString('hex');
        oauthStates.set(state, {
            userId: user._id.toString(),
            type: 'github',
            timestamp: Date.now(),
        });
        const authUrl = githubService_js_1.default.getAuthorizationUrl(state);
        res.json({ authUrl });
    }
    catch (error) {
        console.error('Connect GitHub error:', error);
        res.status(500).json({ message: 'Failed to start GitHub connection' });
    }
};
exports.connectGitHub = connectGitHub;
// GitHub OAuth callback
const githubCallback = async (req, res) => {
    try {
        const { code, state } = req.query;
        const stateData = oauthStates.get(state);
        if (!stateData || stateData.type !== 'github') {
            return res.redirect(`${index_js_1.config.urls.frontend}/settings/integrations?error=invalid_state`);
        }
        oauthStates.delete(state);
        // Exchange code for token
        const { accessToken, scope } = await githubService_js_1.default.exchangeCodeForToken(code);
        // Get user info
        const githubUser = await githubService_js_1.default.getAuthenticatedUser(accessToken);
        // Save or update integration
        await Integration_js_1.default.findOneAndUpdate({ userId: stateData.userId, type: 'github' }, {
            userId: stateData.userId,
            type: 'github',
            status: 'connected',
            accessToken,
            scope,
            isActive: true,
            githubConfig: {
                accountId: githubUser.id,
                accountLogin: githubUser.login,
                accountType: 'user',
                linkedRepositories: [],
                linkCommitsToTasks: true,
                linkPRsToTasks: true,
                createTasksFromIssues: false,
                closeTasksOnPRMerge: true,
            },
        }, { upsert: true, new: true });
        // Log the action
        await AuditLog_js_1.default.create({
            userId: stateData.userId,
            action: 'create',
            entityType: 'integration',
            entityName: 'GitHub',
            severity: 'info',
        });
        res.redirect(`${index_js_1.config.urls.frontend}/settings/integrations?success=github`);
    }
    catch (error) {
        console.error('GitHub callback error:', error);
        res.redirect(`${index_js_1.config.urls.frontend}/settings/integrations?error=github_failed`);
    }
};
exports.githubCallback = githubCallback;
// Get GitHub repositories
const getGitHubRepos = async (req, res) => {
    try {
        const user = req.user;
        const repos = await githubService_js_1.default.getUserRepos(user._id);
        res.json(repos);
    }
    catch (error) {
        console.error('Get GitHub repos error:', error);
        res.status(500).json({ message: 'Failed to get repositories' });
    }
};
exports.getGitHubRepos = getGitHubRepos;
// Link GitHub repo to project
const linkGitHubRepo = async (req, res) => {
    try {
        const user = req.user;
        const { repoId, repoFullName, projectId } = req.body;
        await githubService_js_1.default.linkRepository(user._id, repoId, repoFullName, projectId);
        res.json({ message: 'Repository linked successfully' });
    }
    catch (error) {
        console.error('Link GitHub repo error:', error);
        res.status(500).json({ message: 'Failed to link repository' });
    }
};
exports.linkGitHubRepo = linkGitHubRepo;
// --- Google Calendar Integration ---
// Start Google OAuth flow
const connectGoogleCalendar = async (req, res) => {
    try {
        const user = req.user;
        const state = crypto_1.default.randomBytes(16).toString('hex');
        oauthStates.set(state, {
            userId: user._id.toString(),
            type: 'google_calendar',
            timestamp: Date.now(),
        });
        const authUrl = googleCalendarService_js_1.default.getAuthorizationUrl(state);
        res.json({ authUrl });
    }
    catch (error) {
        console.error('Connect Google Calendar error:', error);
        res.status(500).json({ message: 'Failed to start Google connection' });
    }
};
exports.connectGoogleCalendar = connectGoogleCalendar;
// Google OAuth callback
const googleCallback = async (req, res) => {
    try {
        const { code, state } = req.query;
        const stateData = oauthStates.get(state);
        if (!stateData || stateData.type !== 'google_calendar') {
            return res.redirect(`${index_js_1.config.urls.frontend}/settings/integrations?error=invalid_state`);
        }
        oauthStates.delete(state);
        // Exchange code for tokens
        const { accessToken, refreshToken, expiryDate, scope } = await googleCalendarService_js_1.default.exchangeCodeForTokens(code);
        // Get user info
        const googleUser = await googleCalendarService_js_1.default.getUserInfo(accessToken);
        // Save integration
        await Integration_js_1.default.findOneAndUpdate({ userId: stateData.userId, type: 'google_calendar' }, {
            userId: stateData.userId,
            type: 'google_calendar',
            status: 'connected',
            accessToken,
            refreshToken,
            tokenExpiresAt: expiryDate,
            scope,
            isActive: true,
            googleCalendarConfig: {
                calendarId: 'primary',
                calendarName: googleUser.email,
                syncTasksDueDates: true,
                syncSprintDates: true,
                defaultReminderMinutes: 30,
            },
        }, { upsert: true, new: true });
        // Log the action
        await AuditLog_js_1.default.create({
            userId: stateData.userId,
            action: 'create',
            entityType: 'integration',
            entityName: 'Google Calendar',
            severity: 'info',
        });
        res.redirect(`${index_js_1.config.urls.frontend}/settings/integrations?success=google`);
    }
    catch (error) {
        console.error('Google callback error:', error);
        res.redirect(`${index_js_1.config.urls.frontend}/settings/integrations?error=google_failed`);
    }
};
exports.googleCallback = googleCallback;
// Get Google calendars
const getGoogleCalendars = async (req, res) => {
    try {
        const user = req.user;
        const calendars = await googleCalendarService_js_1.default.listCalendars(user._id);
        res.json(calendars);
    }
    catch (error) {
        console.error('Get Google calendars error:', error);
        res.status(500).json({ message: 'Failed to get calendars' });
    }
};
exports.getGoogleCalendars = getGoogleCalendars;
// --- Slack Integration ---
// Get Slack channels
const getSlackChannels = async (req, res) => {
    try {
        const channels = await slackService_js_1.default.listChannels();
        res.json(channels);
    }
    catch (error) {
        console.error('Get Slack channels error:', error);
        res.status(500).json({ message: 'Failed to get channels' });
    }
};
exports.getSlackChannels = getSlackChannels;
// --- General Integration Management ---
// Update integration settings
const updateIntegration = async (req, res) => {
    try {
        const user = req.user;
        const { integrationId } = req.params;
        const updates = req.body;
        const integration = await Integration_js_1.default.findOne({
            _id: integrationId,
            userId: user._id,
        });
        if (!integration) {
            return res.status(404).json({ message: 'Integration not found' });
        }
        // Update type-specific config
        if (updates.slackConfig && integration.type === 'slack') {
            Object.assign(integration.slackConfig || {}, updates.slackConfig);
        }
        if (updates.githubConfig && integration.type === 'github') {
            Object.assign(integration.githubConfig || {}, updates.githubConfig);
        }
        if (updates.googleCalendarConfig && integration.type === 'google_calendar') {
            Object.assign(integration.googleCalendarConfig || {}, updates.googleCalendarConfig);
        }
        if (updates.isActive !== undefined) {
            integration.isActive = updates.isActive;
        }
        await integration.save();
        res.json({ message: 'Integration updated successfully' });
    }
    catch (error) {
        console.error('Update integration error:', error);
        res.status(500).json({ message: 'Failed to update integration' });
    }
};
exports.updateIntegration = updateIntegration;
// Disconnect integration
const disconnectIntegration = async (req, res) => {
    try {
        const user = req.user;
        const { integrationId } = req.params;
        const integration = await Integration_js_1.default.findOneAndDelete({
            _id: integrationId,
            userId: user._id,
        });
        if (!integration) {
            return res.status(404).json({ message: 'Integration not found' });
        }
        // Log the action
        await AuditLog_js_1.default.create({
            userId: user._id,
            action: 'delete',
            entityType: 'integration',
            entityName: integration.type,
            severity: 'info',
        });
        res.json({ message: 'Integration disconnected successfully' });
    }
    catch (error) {
        console.error('Disconnect integration error:', error);
        res.status(500).json({ message: 'Failed to disconnect integration' });
    }
};
exports.disconnectIntegration = disconnectIntegration;
// Test integration
const testIntegration = async (req, res) => {
    try {
        const user = req.user;
        const { integrationId } = req.params;
        const integration = await Integration_js_1.default.findOne({
            _id: integrationId,
            userId: user._id,
        });
        if (!integration) {
            return res.status(404).json({ message: 'Integration not found' });
        }
        let testResult = { success: false, message: '' };
        switch (integration.type) {
            case 'slack':
                // Test by listing channels
                try {
                    await slackService_js_1.default.listChannels();
                    testResult = { success: true, message: 'Slack connection is working' };
                }
                catch {
                    testResult = { success: false, message: 'Failed to connect to Slack' };
                }
                break;
            case 'github':
                // Test by getting repos
                try {
                    await githubService_js_1.default.getUserRepos(user._id);
                    testResult = { success: true, message: 'GitHub connection is working' };
                }
                catch {
                    testResult = { success: false, message: 'Failed to connect to GitHub' };
                }
                break;
            case 'google_calendar':
                // Test by listing calendars
                try {
                    await googleCalendarService_js_1.default.listCalendars(user._id);
                    testResult = { success: true, message: 'Google Calendar connection is working' };
                }
                catch {
                    testResult = { success: false, message: 'Failed to connect to Google Calendar' };
                }
                break;
        }
        res.json(testResult);
    }
    catch (error) {
        console.error('Test integration error:', error);
        res.status(500).json({ message: 'Failed to test integration' });
    }
};
exports.testIntegration = testIntegration;
//# sourceMappingURL=integrationController.js.map