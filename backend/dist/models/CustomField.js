"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomFieldValue = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const dropdownOptionSchema = new mongoose_1.Schema({
    value: { type: String, required: true },
    label: { type: String, required: true },
    color: { type: String },
}, { _id: false });
const customFieldSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ['text', 'number', 'date', 'dropdown', 'checkbox', 'url', 'email', 'user', 'multiselect'],
        required: true,
    },
    description: { type: String },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Project' },
    workspaceId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Workspace' },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    // Field configuration
    isRequired: { type: Boolean, default: false },
    isGlobal: { type: Boolean, default: false },
    defaultValue: { type: mongoose_1.Schema.Types.Mixed },
    // Type-specific
    options: [dropdownOptionSchema],
    minValue: { type: Number },
    maxValue: { type: Number },
    // Display
    showInList: { type: Boolean, default: true },
    showInCard: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    // Status
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
// Indexes
customFieldSchema.index({ projectId: 1, isActive: 1 });
customFieldSchema.index({ workspaceId: 1, isActive: 1 });
customFieldSchema.index({ isGlobal: 1, isActive: 1 });
// Validation based on type
customFieldSchema.pre('save', function (next) {
    // Ensure options exist for dropdown/multiselect types
    if ((this.type === 'dropdown' || this.type === 'multiselect') && (!this.options || this.options.length === 0)) {
        return next(new Error('Dropdown and multiselect fields require at least one option'));
    }
    next();
});
exports.default = mongoose_1.default.model('CustomField', customFieldSchema);
const customFieldValueSchema = new mongoose_1.Schema({
    taskId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Task', required: true },
    fieldId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'CustomField', required: true },
    value: { type: mongoose_1.Schema.Types.Mixed },
}, { timestamps: true });
customFieldValueSchema.index({ taskId: 1 });
customFieldValueSchema.index({ fieldId: 1 });
customFieldValueSchema.index({ taskId: 1, fieldId: 1 }, { unique: true });
exports.CustomFieldValue = mongoose_1.default.model('CustomFieldValue', customFieldValueSchema);
//# sourceMappingURL=CustomField.js.map