import mongoose from 'mongoose';
interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    start: Date;
    end: Date;
    allDay: boolean;
    url?: string;
    colorId?: string;
}
interface CreateEventData {
    title: string;
    description?: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    reminders?: {
        method: 'email' | 'popup';
        minutes: number;
    }[];
    colorId?: string;
}
declare class GoogleCalendarService {
    private oauth2Client;
    private getCalendarClient;
    listCalendars(userId: mongoose.Types.ObjectId): Promise<Array<{
        id: string;
        name: string;
        primary: boolean;
    }>>;
    getEvents(userId: mongoose.Types.ObjectId, options?: {
        calendarId?: string;
        timeMin?: Date;
        timeMax?: Date;
        maxResults?: number;
    }): Promise<CalendarEvent[]>;
    createEvent(userId: mongoose.Types.ObjectId, eventData: CreateEventData, calendarId?: string): Promise<CalendarEvent>;
    updateEvent(userId: mongoose.Types.ObjectId, eventId: string, eventData: Partial<CreateEventData>, calendarId?: string): Promise<CalendarEvent>;
    deleteEvent(userId: mongoose.Types.ObjectId, eventId: string, calendarId?: string): Promise<void>;
    syncTaskDueDate(userId: mongoose.Types.ObjectId, taskData: {
        taskId: string;
        title: string;
        description?: string;
        dueDate: Date;
        projectName?: string;
        calendarEventId?: string;
    }): Promise<string>;
    syncSprintDates(userId: mongoose.Types.ObjectId, sprintData: {
        sprintId: string;
        name: string;
        startDate: Date;
        endDate: Date;
        projectName?: string;
        startEventId?: string;
        endEventId?: string;
    }): Promise<{
        startEventId: string;
        endEventId: string;
    }>;
    getAuthorizationUrl(state: string): string;
    exchangeCodeForTokens(code: string): Promise<{
        accessToken: string;
        refreshToken?: string;
        expiryDate?: Date;
        scope: string;
    }>;
    getUserInfo(accessToken: string): Promise<{
        id: string;
        email: string;
        name: string;
        picture?: string;
    }>;
}
export declare const googleCalendarService: GoogleCalendarService;
export default googleCalendarService;
//# sourceMappingURL=googleCalendarService.d.ts.map