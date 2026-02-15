export declare const verifyEmailConnection: () => Promise<boolean>;
export declare const sendTaskAssignmentEmail: (assignee: any, task: any, assignedBy: any, projectName: string) => Promise<boolean>;
export declare const sendTaskUpdateEmail: (user: any, task: any, updatedBy: any, updateType: string, oldValue?: string, newValue?: string) => Promise<boolean>;
export declare const sendCommentNotificationEmail: (user: any, task: any, commenter: any, comment: string) => Promise<boolean>;
export declare const sendPasswordResetEmail: (email: string, name: string, resetUrl: string) => Promise<boolean>;
interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
export declare const sendEmail: (options: SendEmailOptions) => Promise<boolean>;
export declare const sendMessageNotificationEmail: (recipient: any, sender: any, content: string, conversation: any) => Promise<boolean>;
export declare const sendProjectAddedEmail: (recipient: any, addedBy: any, project: any) => Promise<boolean>;
export declare const emailService: {
    sendEmail: (options: SendEmailOptions) => Promise<boolean>;
    verifyEmailConnection: () => Promise<boolean>;
    sendTaskAssignmentEmail: (assignee: any, task: any, assignedBy: any, projectName: string) => Promise<boolean>;
    sendTaskUpdateEmail: (user: any, task: any, updatedBy: any, updateType: string, oldValue?: string, newValue?: string) => Promise<boolean>;
    sendCommentNotificationEmail: (user: any, task: any, commenter: any, comment: string) => Promise<boolean>;
    sendPasswordResetEmail: (email: string, name: string, resetUrl: string) => Promise<boolean>;
    sendMessageNotificationEmail: (recipient: any, sender: any, content: string, conversation: any) => Promise<boolean>;
    sendProjectAddedEmail: (recipient: any, addedBy: any, project: any) => Promise<boolean>;
};
export default emailService;
//# sourceMappingURL=emailService.d.ts.map