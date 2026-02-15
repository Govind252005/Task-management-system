"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalSearch = void 0;
const Task_js_1 = require("../models/Task.js");
const Project_js_1 = require("../models/Project.js");
const User_js_1 = require("../models/User.js");
const index_js_1 = require("../config/index.js");
// Global search across tasks, projects, users
const globalSearch = async (req, res) => {
    try {
        const { q, type } = req.query;
        const currentUser = req.user;
        const userRole = currentUser.role;
        const userLevel = index_js_1.ROLE_HIERARCHY[userRole];
        if (!q || typeof q !== 'string' || q.length < 2) {
            res.status(400).json({ message: 'Search query must be at least 2 characters' });
            return;
        }
        const searchRegex = { $regex: q, $options: 'i' };
        const results = { tasks: [], projects: [], users: [] };
        // Search tasks
        if (!type || type === 'all' || type === 'tasks') {
            let taskQuery = {
                $or: [
                    { title: searchRegex },
                    { code: searchRegex },
                    { description: searchRegex },
                ],
            };
            // Role-based filtering for tasks
            if (userLevel < index_js_1.ROLE_HIERARCHY.manager) {
                if (userRole === 'team_lead') {
                    const teamMembers = await User_js_1.User.find({ managerId: currentUser._id });
                    const teamMemberIds = teamMembers.map(m => m._id.toString());
                    teamMemberIds.push(currentUser._id.toString());
                    taskQuery.$and = [
                        taskQuery.$or ? { $or: taskQuery.$or } : {},
                        {
                            $or: [
                                { assignees: { $in: teamMemberIds } },
                                { reporter: currentUser._id },
                            ],
                        },
                    ];
                    delete taskQuery.$or;
                }
                else {
                    taskQuery.$and = [
                        { $or: taskQuery.$or },
                        {
                            $or: [
                                { assignees: currentUser._id },
                                { reporter: currentUser._id },
                            ],
                        },
                    ];
                    delete taskQuery.$or;
                }
            }
            const tasks = await Task_js_1.Task.find(taskQuery)
                .populate('assignees', 'name avatar')
                .populate('projectId', 'name icon color')
                .select('code title status priority dueDate projectId assignees')
                .limit(10)
                .sort({ updatedAt: -1 });
            results.tasks = tasks;
        }
        // Search projects
        if (!type || type === 'all' || type === 'projects') {
            let projectQuery = {
                $or: [
                    { name: searchRegex },
                    { description: searchRegex },
                ],
            };
            // Role-based filtering for projects
            if (userLevel < index_js_1.ROLE_HIERARCHY.manager) {
                projectQuery.$and = [
                    { $or: projectQuery.$or },
                    {
                        $or: [
                            { members: currentUser._id },
                            { createdBy: currentUser._id },
                            { visibility: 'public' },
                        ],
                    },
                ];
                delete projectQuery.$or;
            }
            const projects = await Project_js_1.Project.find(projectQuery)
                .select('name description icon color progress tasksCount')
                .limit(10)
                .sort({ updatedAt: -1 });
            results.projects = projects;
        }
        // Search users (admin/manager only or same department)
        if (!type || type === 'all' || type === 'users') {
            let userQuery = {
                isActive: true,
                $or: [
                    { name: searchRegex },
                    { email: searchRegex },
                ],
            };
            if (userLevel < index_js_1.ROLE_HIERARCHY.manager) {
                userQuery.department = currentUser.department;
            }
            const users = await User_js_1.User.find(userQuery)
                .select('name email avatar role department')
                .limit(10)
                .sort({ name: 1 });
            results.users = users;
        }
        res.json({
            query: q,
            data: results,
            counts: {
                tasks: results.tasks.length,
                projects: results.projects.length,
                users: results.users.length,
                total: results.tasks.length + results.projects.length + results.users.length,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error performing search', error: error.message });
    }
};
exports.globalSearch = globalSearch;
//# sourceMappingURL=searchController.js.map