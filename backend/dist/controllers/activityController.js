"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserActivities = exports.getProjectActivities = exports.getActivities = void 0;
const Activity_js_1 = require("../models/Activity.js");
const index_js_1 = require("../config/index.js");
const User_js_1 = require("../models/User.js");
// Get recent activities
const getActivities = async (req, res) => {
    try {
        const currentUser = req.user;
        const userRole = currentUser.role;
        const userLevel = index_js_1.ROLE_HIERARCHY[userRole];
        const limit = parseInt(req.query.limit) || 20;
        let query = {};
        const requestedUserId = req.query.userId;
        // Role-based filtering
        if (userLevel < index_js_1.ROLE_HIERARCHY.manager) {
            if (requestedUserId && requestedUserId === currentUser._id.toString()) {
                query.userId = currentUser._id;
            }
            else if (userRole === 'team_lead') {
                const teamMembers = await User_js_1.User.find({ managerId: currentUser._id });
                const teamMemberIds = teamMembers.map(m => m._id.toString());
                teamMemberIds.push(currentUser._id.toString());
                query.userId = { $in: teamMemberIds };
            }
            else {
                query.userId = currentUser._id;
            }
        }
        else if (requestedUserId) {
            query.userId = requestedUserId;
        }
        const activities = await Activity_js_1.Activity.find(query)
            .populate('userId', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(limit);
        res.json({ data: activities });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching activities', error: error.message });
    }
};
exports.getActivities = getActivities;
// Get activities by project
const getProjectActivities = async (req, res) => {
    try {
        const { projectId } = req.params;
        const limit = parseInt(req.query.limit) || 20;
        const activities = await Activity_js_1.Activity.find({
            targetType: { $in: ['task', 'project'] },
            $or: [
                { targetId: projectId },
                { 'metadata.projectId': projectId },
            ],
        })
            .populate('userId', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(limit);
        res.json({ data: activities });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching activities', error: error.message });
    }
};
exports.getProjectActivities = getProjectActivities;
// Get user activities
const getUserActivities = async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 20;
        const activities = await Activity_js_1.Activity.find({ userId })
            .populate('userId', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(limit);
        res.json({ data: activities });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching activities', error: error.message });
    }
};
exports.getUserActivities = getUserActivities;
//# sourceMappingURL=activityController.js.map