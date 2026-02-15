import mongoose, { Types } from 'mongoose';
export type ReportType = 'individual' | 'team' | 'project' | 'department' | 'organization';
export interface IReportData {
    tasksCompleted: number;
    tasksInProgress: number;
    tasksTodo: number;
    tasksInReview: number;
    totalHoursLogged: number;
    totalHoursEstimated: number;
    projectsContributed: number;
    averageTaskCompletionTime: number;
    overdueTasks: number;
    tasksByPriority: {
        urgent: number;
        high: number;
        medium: number;
        low: number;
    };
}
export interface IReport {
    userId: Types.ObjectId;
    reportType: ReportType;
    targetId: Types.ObjectId | null;
    generatedAt: Date;
    dateRange: {
        start: Date;
        end: Date;
    };
    data: IReportData;
    charts: {
        productivity: Record<string, number>;
        timeDistribution: Record<string, number>;
        tasksByStatus: Record<string, number>;
        dailyProgress: {
            date: string;
            completed: number;
        }[];
    };
    organizationId?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Report: mongoose.Model<IReport, {}, {}, {}, mongoose.Document<unknown, {}, IReport, {}, {}> & IReport & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
//# sourceMappingURL=Report.d.ts.map