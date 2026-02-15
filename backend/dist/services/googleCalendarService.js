"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleCalendarService = void 0;
const googleapis_1 = require("googleapis");
const index_js_1 = require("../config/index.js");
const Integration_js_1 = __importDefault(require("../models/Integration.js"));
class GoogleCalendarService {
    oauth2Client = new googleapis_1.google.auth.OAuth2(index_js_1.config.google.clientId, index_js_1.config.google.clientSecret, index_js_1.config.google.callbackUrl);
    async getCalendarClient(userId) {
        const integration = await Integration_js_1.default.findOne({
            userId,
            type: 'google_calendar',
            status: 'connected',
            isActive: true,
        });
        if (!integration) {
            return null;
        }
        // Set credentials
        this.oauth2Client.setCredentials({
            access_token: integration.accessToken,
            refresh_token: integration.refreshToken,
        });
        // Handle token refresh if needed
        if (integration.tokenExpiresAt && new Date() >= integration.tokenExpiresAt) {
            try {
                const { credentials } = await this.oauth2Client.refreshAccessToken();
                integration.accessToken = credentials.access_token;
                if (credentials.refresh_token) {
                    integration.refreshToken = credentials.refresh_token;
                }
                integration.tokenExpiresAt = credentials.expiry_date
                    ? new Date(credentials.expiry_date)
                    : undefined;
                await integration.save();
                this.oauth2Client.setCredentials(credentials);
            }
            catch (error) {
                console.error('Failed to refresh Google token:', error);
                integration.status = 'expired';
                await integration.save();
                return null;
            }
        }
        return googleapis_1.google.calendar({ version: 'v3', auth: this.oauth2Client });
    }
    // Get list of user's calendars
    async listCalendars(userId) {
        const calendar = await this.getCalendarClient(userId);
        if (!calendar) {
            throw new Error('Google Calendar integration not connected');
        }
        try {
            const { data } = await calendar.calendarList.list();
            return (data.items || []).map((cal) => ({
                id: cal.id || '',
                name: cal.summary || '',
                primary: cal.primary || false,
            }));
        }
        catch (error) {
            console.error('Failed to list calendars:', error);
            throw new Error('Failed to list calendars');
        }
    }
    // Get events from calendar
    async getEvents(userId, options) {
        const calendar = await this.getCalendarClient(userId);
        if (!calendar) {
            throw new Error('Google Calendar integration not connected');
        }
        const integration = await Integration_js_1.default.findOne({
            userId,
            type: 'google_calendar',
        });
        const calendarId = options?.calendarId || integration?.googleCalendarConfig?.calendarId || 'primary';
        try {
            const { data } = await calendar.events.list({
                calendarId,
                timeMin: options?.timeMin?.toISOString() || new Date().toISOString(),
                timeMax: options?.timeMax?.toISOString(),
                maxResults: options?.maxResults || 100,
                singleEvents: true,
                orderBy: 'startTime',
            });
            return (data.items || []).map((event) => ({
                id: event.id || '',
                title: event.summary || '',
                description: event.description || undefined,
                start: new Date(event.start?.dateTime || event.start?.date || Date.now()),
                end: new Date(event.end?.dateTime || event.end?.date || Date.now()),
                allDay: !event.start?.dateTime,
                url: event.htmlLink || undefined,
                colorId: event.colorId || undefined,
            }));
        }
        catch (error) {
            console.error('Failed to get calendar events:', error);
            throw new Error('Failed to get events');
        }
    }
    // Create an event (for task due dates or sprints)
    async createEvent(userId, eventData, calendarId) {
        const calendar = await this.getCalendarClient(userId);
        if (!calendar) {
            throw new Error('Google Calendar integration not connected');
        }
        const integration = await Integration_js_1.default.findOne({
            userId,
            type: 'google_calendar',
        });
        const targetCalendarId = calendarId || integration?.googleCalendarConfig?.calendarId || 'primary';
        try {
            const event = {
                summary: eventData.title,
                description: eventData.description,
                colorId: eventData.colorId,
            };
            if (eventData.allDay) {
                event.start = { date: eventData.start.toISOString().split('T')[0] };
                event.end = { date: eventData.end.toISOString().split('T')[0] };
            }
            else {
                event.start = { dateTime: eventData.start.toISOString() };
                event.end = { dateTime: eventData.end.toISOString() };
            }
            if (eventData.reminders && eventData.reminders.length > 0) {
                event.reminders = {
                    useDefault: false,
                    overrides: eventData.reminders,
                };
            }
            const { data } = await calendar.events.insert({
                calendarId: targetCalendarId,
                requestBody: event,
            });
            return {
                id: data.id || '',
                title: data.summary || '',
                description: data.description || undefined,
                start: new Date(data.start?.dateTime || data.start?.date || Date.now()),
                end: new Date(data.end?.dateTime || data.end?.date || Date.now()),
                allDay: !data.start?.dateTime,
                url: data.htmlLink || undefined,
                colorId: data.colorId || undefined,
            };
        }
        catch (error) {
            console.error('Failed to create calendar event:', error);
            throw new Error('Failed to create event');
        }
    }
    // Update an event
    async updateEvent(userId, eventId, eventData, calendarId) {
        const calendar = await this.getCalendarClient(userId);
        if (!calendar) {
            throw new Error('Google Calendar integration not connected');
        }
        const integration = await Integration_js_1.default.findOne({
            userId,
            type: 'google_calendar',
        });
        const targetCalendarId = calendarId || integration?.googleCalendarConfig?.calendarId || 'primary';
        try {
            const event = {};
            if (eventData.title)
                event.summary = eventData.title;
            if (eventData.description !== undefined)
                event.description = eventData.description;
            if (eventData.colorId)
                event.colorId = eventData.colorId;
            if (eventData.start && eventData.end) {
                if (eventData.allDay) {
                    event.start = { date: eventData.start.toISOString().split('T')[0] };
                    event.end = { date: eventData.end.toISOString().split('T')[0] };
                }
                else {
                    event.start = { dateTime: eventData.start.toISOString() };
                    event.end = { dateTime: eventData.end.toISOString() };
                }
            }
            const { data } = await calendar.events.patch({
                calendarId: targetCalendarId,
                eventId,
                requestBody: event,
            });
            return {
                id: data.id || '',
                title: data.summary || '',
                description: data.description || undefined,
                start: new Date(data.start?.dateTime || data.start?.date || Date.now()),
                end: new Date(data.end?.dateTime || data.end?.date || Date.now()),
                allDay: !data.start?.dateTime,
                url: data.htmlLink || undefined,
                colorId: data.colorId || undefined,
            };
        }
        catch (error) {
            console.error('Failed to update calendar event:', error);
            throw new Error('Failed to update event');
        }
    }
    // Delete an event
    async deleteEvent(userId, eventId, calendarId) {
        const calendar = await this.getCalendarClient(userId);
        if (!calendar) {
            throw new Error('Google Calendar integration not connected');
        }
        const integration = await Integration_js_1.default.findOne({
            userId,
            type: 'google_calendar',
        });
        const targetCalendarId = calendarId || integration?.googleCalendarConfig?.calendarId || 'primary';
        try {
            await calendar.events.delete({
                calendarId: targetCalendarId,
                eventId,
            });
        }
        catch (error) {
            console.error('Failed to delete calendar event:', error);
            throw new Error('Failed to delete event');
        }
    }
    // Sync task due date to calendar
    async syncTaskDueDate(userId, taskData) {
        const integration = await Integration_js_1.default.findOne({
            userId,
            type: 'google_calendar',
            isActive: true,
        });
        if (!integration?.googleCalendarConfig?.syncTasksDueDates) {
            throw new Error('Task sync is disabled');
        }
        const eventTitle = taskData.projectName
            ? `[${taskData.projectName}] ${taskData.title}`
            : taskData.title;
        const eventDescription = [
            taskData.description,
            '',
            '---',
            'Created from Task Management App',
            `Task ID: ${taskData.taskId}`,
        ]
            .filter(Boolean)
            .join('\n');
        const eventData = {
            title: eventTitle,
            description: eventDescription,
            start: taskData.dueDate,
            end: new Date(taskData.dueDate.getTime() + 60 * 60 * 1000), // 1 hour duration
            reminders: [{ method: 'popup', minutes: integration.googleCalendarConfig.defaultReminderMinutes }],
            colorId: integration.googleCalendarConfig.colorId,
        };
        if (taskData.calendarEventId) {
            const event = await this.updateEvent(userId, taskData.calendarEventId, eventData);
            return event.id;
        }
        else {
            const event = await this.createEvent(userId, eventData);
            return event.id;
        }
    }
    // Sync sprint dates to calendar
    async syncSprintDates(userId, sprintData) {
        const integration = await Integration_js_1.default.findOne({
            userId,
            type: 'google_calendar',
            isActive: true,
        });
        if (!integration?.googleCalendarConfig?.syncSprintDates) {
            throw new Error('Sprint sync is disabled');
        }
        const prefix = sprintData.projectName ? `[${sprintData.projectName}] ` : '';
        // Create/update sprint start event
        const startEvent = sprintData.startEventId
            ? await this.updateEvent(userId, sprintData.startEventId, {
                title: `${prefix}Sprint Start: ${sprintData.name}`,
                start: sprintData.startDate,
                end: sprintData.startDate,
                allDay: true,
            })
            : await this.createEvent(userId, {
                title: `${prefix}Sprint Start: ${sprintData.name}`,
                start: sprintData.startDate,
                end: sprintData.startDate,
                allDay: true,
                colorId: '10', // Green
            });
        // Create/update sprint end event
        const endEvent = sprintData.endEventId
            ? await this.updateEvent(userId, sprintData.endEventId, {
                title: `${prefix}Sprint End: ${sprintData.name}`,
                start: sprintData.endDate,
                end: sprintData.endDate,
                allDay: true,
            })
            : await this.createEvent(userId, {
                title: `${prefix}Sprint End: ${sprintData.name}`,
                start: sprintData.endDate,
                end: sprintData.endDate,
                allDay: true,
                colorId: '11', // Red
            });
        return {
            startEventId: startEvent.id,
            endEventId: endEvent.id,
        };
    }
    // OAuth flow helpers
    getAuthorizationUrl(state) {
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/calendar',
                'https://www.googleapis.com/auth/calendar.events',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
            ],
            state,
            prompt: 'consent', // Force consent to get refresh token
        });
    }
    async exchangeCodeForTokens(code) {
        const { tokens } = await this.oauth2Client.getToken(code);
        return {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || undefined,
            expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
            scope: tokens.scope || '',
        };
    }
    async getUserInfo(accessToken) {
        this.oauth2Client.setCredentials({ access_token: accessToken });
        const oauth2 = googleapis_1.google.oauth2({ version: 'v2', auth: this.oauth2Client });
        const { data } = await oauth2.userinfo.get();
        return {
            id: data.id || '',
            email: data.email || '',
            name: data.name || '',
            picture: data.picture || undefined,
        };
    }
}
exports.googleCalendarService = new GoogleCalendarService();
exports.default = exports.googleCalendarService;
//# sourceMappingURL=googleCalendarService.js.map