import mongoose, { Document } from 'mongoose';
export interface IRecurringTask extends Document {
    name: string;
    projectId: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    templateId?: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignees: mongoose.Types.ObjectId[];
    labels: mongoose.Types.ObjectId[];
    estimatedHours?: number;
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
    customCron?: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    monthOfYear?: number;
    time: string;
    timezone: string;
    startDate: Date;
    endDate?: Date;
    nextRunAt: Date;
    lastRunAt?: Date;
    runCount: number;
    maxRuns?: number;
    isActive: boolean;
    isPaused: boolean;
    createdTasks: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IRecurringTask, {}, {}, {}, mongoose.Document<unknown, {}, IRecurringTask, {}, {}> & IRecurringTask & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=RecurringTask.d.ts.map