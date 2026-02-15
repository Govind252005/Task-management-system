import mongoose, { Types } from 'mongoose';
export interface IAttachment {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    publicId: string;
    taskId: Types.ObjectId;
    uploadedBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Attachment: mongoose.Model<IAttachment, {}, {}, {}, mongoose.Document<unknown, {}, IAttachment, {}, {}> & IAttachment & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
//# sourceMappingURL=Attachment.d.ts.map