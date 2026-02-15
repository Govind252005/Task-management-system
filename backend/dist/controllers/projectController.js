"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectMembers = exports.getProjectMembers = exports.deleteProject = exports.updateProject = exports.createProject = exports.getProjectById = exports.getAllProjects = void 0;
const Project_js_1 = require("../models/Project.js");
const User_js_1 = require("../models/User.js");
const Activity_js_1 = require("../models/Activity.js");
const index_js_1 = require("../config/index.js");
const notificationService_js_1 = require("../services/notificationService.js");
const emailService_js_1 = require("../services/emailService.js");
// Get all projects (with role-based filtering)
const getAllProjects = async (req, res) => {
    try {
        const currentUser = req.user;
        const userRole = currentUser.role;
        const userLevel = index_js_1.ROLE_HIERARCHY[userRole];
        let query = {};
        // Role-based filtering
        if (userLevel < index_js_1.ROLE_HIERARCHY.admin) {
            if (userLevel >= index_js_1.ROLE_HIERARCHY.manager) {
                // Managers can see public, team, and their department's projects
                query.$or = [
                    { visibility: 'public' },
                    { members: currentUser._id },
                    { departmentId: currentUser.department },
                ];
            }
            else {
                // Employees and team leads can only see their projects
                query.$or = [
                    { visibility: 'public' },
                    { members: currentUser._id },
                ];
            }
        }
        const projects = await Project_js_1.Project.find(query)
            .populate('members', 'name email avatar')
            .populate('teamLeadId', 'name email avatar')
            .sort({ updatedAt: -1 });
        res.json({ data: projects });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching projects', error: error.message });
    }
};
exports.getAllProjects = getAllProjects;
// Get project by ID
const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project_js_1.Project.findById(id)
            .populate('members', 'name email avatar role')
            .populate('teamLeadId', 'name email avatar')
            .populate('createdBy', 'name email avatar');
        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }
        res.json({ project });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching project', error: error.message });
    }
};
exports.getProjectById = getProjectById;
// Create new project
const createProject = async (req, res) => {
    try {
        const currentUser = req.user;
        const { name, description, icon, color, deadline, members, departmentId, teamLeadId, visibility, } = req.body;
        const project = new Project_js_1.Project({
            name,
            description,
            icon: icon || '📁',
            color: color || 'hsl(217 91% 60%)',
            deadline: deadline || null,
            members: members || [currentUser._id],
            departmentId: departmentId || currentUser.department,
            teamLeadId: teamLeadId || currentUser._id,
            visibility: visibility || 'team',
            createdBy: currentUser._id,
        });
        await project.save();
        // Create activity
        await Activity_js_1.Activity.create({
            userId: currentUser._id,
            action: 'created project',
            target: project.name,
            targetType: 'project',
            targetId: project._id,
        });
        // Notify all newly added members (including team leads) except the creator
        if (Array.isArray(project.members) && project.members.length > 0) {
            const memberIds = project.members.map((m) => m.toString());
            const recipients = memberIds.filter((id) => id !== currentUser._id.toString());
            for (const memberId of recipients) {
                const member = await User_js_1.User.findById(memberId);
                if (!member)
                    continue;
                await (0, notificationService_js_1.createNotification)({
                    userId: memberId,
                    fromUserId: currentUser._id.toString(),
                    action: `added you to the project "${project.name}"`,
                    target: project.name,
                    targetType: 'project',
                    projectId: project._id.toString(),
                });
                await (0, emailService_js_1.sendProjectAddedEmail)(member, currentUser, project);
            }
        }
        const populatedProject = await Project_js_1.Project.findById(project._id)
            .populate('members', 'name email avatar')
            .populate('teamLeadId', 'name email avatar');
        res.status(201).json({
            message: 'Project created successfully',
            project: populatedProject,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating project', error: error.message });
    }
};
exports.createProject = createProject;
// Update project
const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        // Ensure undefined deadline doesn't wipe existing value
        if (updateData.deadline === undefined) {
            delete updateData.deadline;
        }
        const project = await Project_js_1.Project.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        })
            .populate('members', 'name email avatar')
            .populate('teamLeadId', 'name email avatar');
        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }
        res.json({
            message: 'Project updated successfully',
            project,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating project', error: error.message });
    }
};
exports.updateProject = updateProject;
// Delete project
const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project_js_1.Project.findByIdAndDelete(id);
        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }
        res.json({ message: 'Project deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting project', error: error.message });
    }
};
exports.deleteProject = deleteProject;
// Get project members
const getProjectMembers = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project_js_1.Project.findById(id).populate('members', 'name email avatar role department');
        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }
        res.json({ members: project.members });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching project members', error: error.message });
    }
};
exports.getProjectMembers = getProjectMembers;
// Update project members
const updateProjectMembers = async (req, res) => {
    try {
        const { id } = req.params;
        const { members } = req.body;
        const existing = await Project_js_1.Project.findById(id).select('members name');
        const previousMemberIds = existing?.members.map((m) => m.toString()) || [];
        const project = await Project_js_1.Project.findByIdAndUpdate(id, { members }, { new: true }).populate('members', 'name email avatar');
        if (!project) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }
        const newMemberIds = (members || []).filter((m) => !previousMemberIds.includes(m.toString()));
        if (newMemberIds.length > 0) {
            for (const memberId of newMemberIds) {
                const member = await User_js_1.User.findById(memberId);
                if (!member)
                    continue;
                await (0, notificationService_js_1.createNotification)({
                    userId: memberId.toString(),
                    fromUserId: req.user._id.toString(),
                    action: `added you to the project "${project.name}"`,
                    target: project.name,
                    targetType: 'project',
                    projectId: project._id.toString(),
                });
                await (0, emailService_js_1.sendProjectAddedEmail)(member, req.user, project);
            }
        }
        res.json({
            message: 'Project members updated successfully',
            members: project.members,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating project members', error: error.message });
    }
};
exports.updateProjectMembers = updateProjectMembers;
//# sourceMappingURL=projectController.js.map