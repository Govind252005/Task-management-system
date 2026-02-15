import mongoose, { Types, Document } from 'mongoose';
export type ConversationType = 'direct' | 'team';
export interface IConversation extends Document {
    type: ConversationType;
    name?: string;
    teamId?: Types.ObjectId;
    participantIds: Types.ObjectId[];
    createdBy: Types.ObjectId;
    lastMessageAt?: Date;
    lastMessageSnippet?: string;
    lastMessageSender?: Types.ObjectId;
    unreadCounts: Map<string, number>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Conversation: mongoose.Model<IConversation, {}, {}, {}, mongoose.Document<unknown, {}, IConversation, {}, {}> & IConversation & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Conversation;
//# sourceMappingURL=Conversation.d.ts.map