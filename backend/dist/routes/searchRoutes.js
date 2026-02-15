"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const searchController_js_1 = require("../controllers/searchController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
router.use(auth_js_1.authenticate);
// Global search
router.get('/', searchController_js_1.globalSearch);
exports.default = router;
//# sourceMappingURL=searchRoutes.js.map