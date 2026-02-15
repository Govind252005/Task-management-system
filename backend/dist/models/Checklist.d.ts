import mongoose, { Document } from 'mongoose';
export interface IChecklistItem {
    _id?: mongoose.Types.ObjectId;
    title: string;
    completed: boolean;
    completedAt?: Date;
    completedBy?: mongoose.Types.ObjectId;
    order: number;
}
export interface IChecklist extends Document {
    taskId: mongoose.Types.ObjectId;
    title: string;
    items: IChecklistItem[];
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IChecklist, {}, {}, {}, mongoose.Document<unknown, {}, IChecklist, {}, {}> & IChecklist & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Checklist.d.ts.map