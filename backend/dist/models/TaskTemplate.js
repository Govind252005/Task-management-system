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
const mongoose_1 = __importStar(require("mongoose"));
const taskTemplateSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String },
    projectId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Project' },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    // Template fields
    title: { type: String, required: true },
    taskDescription: { type: String },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
    },
    estimatedHours: { type: Number },
    labels: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Label' }],
    defaultAssignees: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    checklists: [
        {
            title: { type: String, required: true },
            items: [
                {
                    title: { type: String, required: true },
                    order: { type: Number, default: 0 },
                },
            ],
        },
    ],
    customFields: [
        {
            fieldId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'CustomField' },
            value: { type: mongoose_1.Schema.Types.Mixed },
        },
    ],
    isGlobal: { type: Boolean, default: false },
    usageCount: { type: Number, default: 0 },
}, { timestamps: true });
// Indexes
taskTemplateSchema.index({ projectId: 1 });
taskTemplateSchema.index({ createdBy: 1 });
taskTemplateSchema.index({ isGlobal: 1 });
exports.default = mongoose_1.default.model('TaskTemplate', taskTemplateSchema);
//# sourceMappingURL=TaskTemplate.js.map