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
const express_1 = require("express");
const auth_js_1 = require("../middleware/auth.js");
const checklistController = __importStar(require("../controllers/checklistController.js"));
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_js_1.authenticate);
// Get checklists for a task
router.get('/tasks/:taskId/checklists', checklistController.getTaskChecklists);
// Create a checklist
router.post('/tasks/:taskId/checklists', checklistController.createChecklist);
// Update checklist
router.patch('/checklists/:checklistId', checklistController.updateChecklist);
// Delete checklist
router.delete('/checklists/:checklistId', checklistController.deleteChecklist);
// Add item to checklist
router.post('/checklists/:checklistId/items', checklistController.addChecklistItem);
// Update checklist item
router.patch('/checklists/:checklistId/items/:itemId', checklistController.updateChecklistItem);
// Delete checklist item
router.delete('/checklists/:checklistId/items/:itemId', checklistController.deleteChecklistItem);
// Toggle item completion
router.post('/checklists/:checklistId/items/:itemId/toggle', checklistController.toggleChecklistItem);
// Reorder items
router.post('/checklists/:checklistId/reorder', checklistController.reorderChecklistItems);
exports.default = router;
//# sourceMappingURL=checklistRoutes.js.map