import mongoose, { Document } from 'mongoose';
export interface ITaskTemplate extends Document {
    name: string;
    description?: string;
    projectId?: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    title: string;
    taskDescription?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimatedHours?: number;
    labels: mongoose.Types.ObjectId[];
    defaultAssignees: mongoose.Types.ObjectId[];
    checklists: {
        title: string;
        items: {
            title: string;
            order: number;
        }[];
    }[];
    customFields: {
        fieldId: mongoose.Types.ObjectId;
        value: any;
    }[];
    isGlobal: boolean;
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ITaskTemplate, {}, {}, {}, mongoose.Document<unknown, {}, ITaskTemplate, {}, {}> & ITaskTemplate & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=TaskTemplate.d.ts.map