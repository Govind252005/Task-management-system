import mongoose, { Document } from 'mongoose';
export interface IMention {
    userId: mongoose.Types.ObjectId;
    username: string;
    startIndex: number;
    endIndex: number;
}
export interface IComment extends Document {
    taskId: mongoose.Types.ObjectId;
    authorId: mongoose.Types.ObjectId;
    content: string;
    mentions: IMention[];
    attachments: {
        filename: string;
        url: string;
        publicId?: string;
        mimeType: string;
        size: number;
    }[];
    parentId?: mongoose.Types.ObjectId;
    reactions: {
        emoji: string;
        users: mongoose.Types.ObjectId[];
    }[];
    isEdited: boolean;
    editedAt?: Date;
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IComment, {}, {}, {}, mongoose.Document<unknown, {}, IComment, {}, {}> & IComment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Comment.d.ts.map