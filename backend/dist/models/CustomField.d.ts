import mongoose, { Document } from 'mongoose';
export type FieldType = 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'url' | 'email' | 'user' | 'multiselect';
export interface IDropdownOption {
    value: string;
    label: string;
    color?: string;
}
export interface ICustomField extends Document {
    name: string;
    type: FieldType;
    description?: string;
    projectId?: mongoose.Types.ObjectId;
    workspaceId?: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    isRequired: boolean;
    isGlobal: boolean;
    defaultValue?: any;
    options?: IDropdownOption[];
    minValue?: number;
    maxValue?: number;
    showInList: boolean;
    showInCard: boolean;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ICustomField, {}, {}, {}, mongoose.Document<unknown, {}, ICustomField, {}, {}> & ICustomField & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
export interface ICustomFieldValue extends Document {
    taskId: mongoose.Types.ObjectId;
    fieldId: mongoose.Types.ObjectId;
    value: any;
    createdAt: Date;
    updatedAt: Date;
}
export declare const CustomFieldValue: mongoose.Model<ICustomFieldValue, {}, {}, {}, mongoose.Document<unknown, {}, ICustomFieldValue, {}, {}> & ICustomFieldValue & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=CustomField.d.ts.map