export interface NotificationPayload {
    userId: string;
    fromUserId: string;
    action: string;
    target: string;
    targetType: 'task' | 'project' | 'comment' | 'sprint' | 'user' | 'message';
    taskId?: string;
    projectId?: string;
}
export declare const createNotification: (payload: NotificationPayload) => Promise<any>;
export declare const notifyTaskAssignment: (task: any, newAssignees: string[], assignedBy: any) => Promise<void>;
export declare const notifyTaskStatusChange: (task: any, updatedBy: any, oldStatus: string, newStatus: string) => Promise<void>;
export declare const notifyComment: (task: any, commenter: any, comment: string) => Promise<void>;
export declare const getUserNotifications: (userId: string, limit?: number) => Promise<any[]>;
export declare const markNotificationRead: (notificationId: string, userId: string) => Promise<any>;
export declare const markAllNotificationsRead: (userId: string) => Promise<void>;
export declare const getUnreadCount: (userId: string) => Promise<number>;
interface GenericNotificationPayload {
    userId: any;
    type: string;
    title: string;
    message: string;
    relatedEntity?: {
        type: string;
        id: any;
    };
}
export declare const createGenericNotification: (payload: GenericNotificationPayload) => Promise<any>;
export declare const notificationService: {
    createNotification: (payload: GenericNotificationPayload) => Promise<any>;
    notifyTaskAssignment: (task: any, newAssignees: string[], assignedBy: any) => Promise<void>;
    notifyTaskStatusChange: (task: any, updatedBy: any, oldStatus: string, newStatus: string) => Promise<void>;
    notifyComment: (task: any, commenter: any, comment: string) => Promise<void>;
    getUserNotifications: (userId: string, limit?: number) => Promise<any[]>;
    markNotificationRead: (notificationId: string, userId: string) => Promise<any>;
    markAllNotificationsRead: (userId: string) => Promise<void>;
    getUnreadCount: (userId: string) => Promise<number>;
};
export default notificationService;
//# sourceMappingURL=notificationService.d.ts.map