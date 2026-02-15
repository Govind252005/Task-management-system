"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const labelController_js_1 = require("../controllers/labelController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_js_1.authenticate);
// Get all labels
router.get('/', labelController_js_1.getAllLabels);
// Get label by ID
router.get('/:id', labelController_js_1.getLabelById);
// Create new label
router.post('/', labelController_js_1.createLabel);
// Update label
router.put('/:id', labelController_js_1.updateLabel);
// Delete label (Manager and above)
router.delete('/:id', (0, auth_js_1.authorizeMinRole)('manager'), labelController_js_1.deleteLabel);
exports.default = router;
//# sourceMappingURL=labelRoutes.js.map