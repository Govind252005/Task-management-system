"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTasksByProject = exports.getMyTasks = exports.addComment = exports.updateTaskAssignees = exports.updateTaskStatus = exports.deleteTask = exports.updateTask = exports.createTask = exports.getTaskById = exports.getAllTasks = void 0;
const Task_js_1 = require("../models/Task.js");
const Project_js_1 = require("../models/Project.js");
const User_js_1 = require("../models/User.js");
const Activity_js_1 = require("../models/Activity.js");
const index_js_1 = require("../config/index.js");
const notificationService_js_1 = require("../services/notificationService.js");
// Get all tasks (with role-based filtering)
const getAllTasks = async (req, res) => {
    try {
        const currentUser = req.user;
        const userRole = currentUser.role;
        const userLevel = index_js_1.ROLE_HIERARCHY[userRole];
        let query = {};
        const projectIdParam = req.query.projectId;
        let memberCanSeeProject = false;
        if (projectIdParam) {
            const project = await Project_js_1.Project.findById(projectIdParam).select('_id members');
            memberCanSeeProject = !!project && project.members.some((m) => m.toString() === currentUser._id.toString());
            query.projectId = projectIdParam;
        }
        // Role-based filtering
        if (userLevel < index_js_1.ROLE_HIERARCHY.manager) {
            if (memberCanSeeProject) {
                // Allow project members to view all tasks within that project
                query.projectId = projectIdParam;
            }
            else if (userRole === 'team_lead') {
                // Team leads can see their own and team members' tasks
                const teamMembers = await User_js_1.User.find({ managerId: currentUser._id });
                const teamMemberIds = teamMembers.map(m => m._id.toString());
                teamMemberIds.push(currentUser._id.toString());
                query.$or = [
                    { assignees: { $in: teamMemberIds } },
                    { reporter: currentUser._id },
                ];
            }
            else {
                // Employees can only see their own tasks
                query.$or = [
                    { assignees: currentUser._id },
                    { reporter: currentUser._id },
                ];
            }
        }
        // Apply filters from query params
        const { status, priority, assignee, search } = req.query;
        if (status)
            query.status = status;
        if (priority)
            query.priority = priority;
        if (!memberCanSeeProject && projectIdParam && !query.projectId) {
            query.projectId = projectIdParam;
        }
        if (assignee)
            query.assignees = assignee;
        if (search) {
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { code: { $regex: search, $options: 'i' } },
                ],
            });
        }
        const tasks = await Task_js_1.Task.find(query)
            .populate('assignees', 'name email avatar')
            .populate('reporter', 'name email avatar')
            .populate('projectId', 'name icon color')
            .sort({ updatedAt: -1 });
        res.json({ data: tasks });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
};
exports.getAllTasks = getAllTasks;
// Get task by ID
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task_js_1.Task.findById(id)
            .populate('assignees', 'name email avatar')
            .populate('reporter', 'name email avatar')
            .populate('projectId', 'name icon color')
            .populate('comments.userId', 'name avatar');
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }
        res.json({ task });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching task', error: error.message });
    }
};
exports.getTaskById = getTaskById;
// Create new task
const createTask = async (req, res) => {
    try {
        const currentUser = req.user;
        const { title, description, status, priority, assignees, labels, dueDate, timeEstimate, sprint, dependencies, projectId, parentId, } = req.body;
        // Generate task code
        const count = await Task_js_1.Task.countDocuments();
        const code = `TASK-${(count + 1).toString().padStart(3, '0')}`;
        const task = new Task_js_1.Task({
            code,
            title,
            description,
            status: status || 'todo',
            priority: priority || 'medium',
            assignees: assignees || [],
            reporter: currentUser._id,
            labels: labels || [],
            dueDate,
            timeEstimate: timeEstimate || 0,
            sprint,
            dependencies: dependencies || [],
            projectId,
            parentId,
        });
        await task.save();
        // Update project task count
        await Project_js_1.Project.findByIdAndUpdate(projectId, {
            $inc: { tasksCount: 1 },
        });
        // Create activity
        await Activity_js_1.Activity.create({
            userId: currentUser._id,
            action: 'created task',
            target: task.title,
            targetType: 'task',
            targetId: task._id,
        });
        // Notify assignees
        if (assignees && assignees.length > 0) {
            await (0, notificationService_js_1.notifyTaskAssignment)(task, assignees, currentUser);
        }
        // Populate for response
        const populatedTask = await Task_js_1.Task.findById(task._id)
            .populate('assignees', 'name email avatar')
            .populate('reporter', 'name email avatar')
            .populate('projectId', 'name icon color');
        res.status(201).json({
            message: 'Task created successfully',
            task: populatedTask,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating task', error: error.message });
    }
};
exports.createTask = createTask;
// Update task
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;
        const updateData = req.body;
        const task = await Task_js_1.Task.findById(id);
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }
        const oldStatus = task.status;
        const oldAssignees = task.assignees.map(a => a.toString());
        // Update task
        Object.assign(task, updateData);
        await task.save();
        // Check for status change
        if (updateData.status && updateData.status !== oldStatus) {
            await (0, notificationService_js_1.notifyTaskStatusChange)(task, currentUser, oldStatus, updateData.status);
            // Update project completed tasks count
            if (updateData.status === 'done') {
                await Project_js_1.Project.findByIdAndUpdate(task.projectId, {
                    $inc: { completedTasks: 1 },
                });
            }
            else if (oldStatus === 'done') {
                await Project_js_1.Project.findByIdAndUpdate(task.projectId, {
                    $inc: { completedTasks: -1 },
                });
            }
            // Create activity
            await Activity_js_1.Activity.create({
                userId: currentUser._id,
                action: `moved task to ${updateData.status}`,
                target: task.title,
                targetType: 'task',
                targetId: task._id,
            });
        }
        // Check for new assignees
        if (updateData.assignees) {
            const newAssignees = updateData.assignees.filter((a) => !oldAssignees.includes(a));
            if (newAssignees.length > 0) {
                await (0, notificationService_js_1.notifyTaskAssignment)(task, newAssignees, currentUser);
            }
        }
        // Populate for response
        const updatedTask = await Task_js_1.Task.findById(id)
            .populate('assignees', 'name email avatar')
            .populate('reporter', 'name email avatar')
            .populate('projectId', 'name icon color');
        res.json({
            message: 'Task updated successfully',
            task: updatedTask,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating task', error: error.message });
    }
};
exports.updateTask = updateTask;
// Delete task
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;
        const task = await Task_js_1.Task.findById(id);
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }
        // Update project task count
        await Project_js_1.Project.findByIdAndUpdate(task.projectId, {
            $inc: {
                tasksCount: -1,
                completedTasks: task.status === 'done' ? -1 : 0,
            },
        });
        await Task_js_1.Task.findByIdAndDelete(id);
        // Create activity
        await Activity_js_1.Activity.create({
            userId: currentUser._id,
            action: 'deleted task',
            target: task.title,
            targetType: 'task',
            targetId: task._id,
        });
        res.json({ message: 'Task deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting task', error: error.message });
    }
};
exports.deleteTask = deleteTask;
// Update task status
const updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const currentUser = req.user;
        const task = await Task_js_1.Task.findById(id);
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }
        const oldStatus = task.status;
        task.status = status;
        await task.save();
        // Notify about status change
        await (0, notificationService_js_1.notifyTaskStatusChange)(task, currentUser, oldStatus, status);
        // Update project completed tasks count
        if (status === 'done' && oldStatus !== 'done') {
            await Project_js_1.Project.findByIdAndUpdate(task.projectId, {
                $inc: { completedTasks: 1 },
            });
        }
        else if (status !== 'done' && oldStatus === 'done') {
            await Project_js_1.Project.findByIdAndUpdate(task.projectId, {
                $inc: { completedTasks: -1 },
            });
        }
        res.json({
            message: 'Task status updated successfully',
            task,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating task status', error: error.message });
    }
};
exports.updateTaskStatus = updateTaskStatus;
// Update task assignees
const updateTaskAssignees = async (req, res) => {
    try {
        const { id } = req.params;
        const { assignees } = req.body;
        const currentUser = req.user;
        const task = await Task_js_1.Task.findById(id);
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }
        const oldAssignees = task.assignees.map(a => a.toString());
        const newAssignees = assignees.filter((a) => !oldAssignees.includes(a));
        task.assignees = assignees;
        await task.save();
        // Notify new assignees
        if (newAssignees.length > 0) {
            await (0, notificationService_js_1.notifyTaskAssignment)(task, newAssignees, currentUser);
        }
        const updatedTask = await Task_js_1.Task.findById(id)
            .populate('assignees', 'name email avatar');
        res.json({
            message: 'Task assignees updated successfully',
            task: updatedTask,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating task assignees', error: error.message });
    }
};
exports.updateTaskAssignees = updateTaskAssignees;
// Add comment to task
const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const currentUser = req.user;
        const task = await Task_js_1.Task.findById(id);
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }
        task.comments.push({
            userId: currentUser._id,
            content,
            createdAt: new Date(),
        });
        await task.save();
        // Notify about comment
        await (0, notificationService_js_1.notifyComment)(task, currentUser, content);
        // Create activity
        await Activity_js_1.Activity.create({
            userId: currentUser._id,
            action: 'commented on',
            target: task.title,
            targetType: 'comment',
            targetId: task._id,
        });
        const updatedTask = await Task_js_1.Task.findById(id)
            .populate('comments.userId', 'name avatar');
        res.json({
            message: 'Comment added successfully',
            task: updatedTask,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
};
exports.addComment = addComment;
// Get my tasks
const getMyTasks = async (req, res) => {
    try {
        const currentUser = req.user;
        const { status } = req.query;
        let query = { assignees: currentUser._id };
        if (status)
            query.status = status;
        const tasks = await Task_js_1.Task.find(query)
            .populate('assignees', 'name email avatar')
            .populate('reporter', 'name email avatar')
            .populate('projectId', 'name icon color')
            .sort({ dueDate: 1, priority: -1 });
        res.json({ tasks });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
};
exports.getMyTasks = getMyTasks;
// Get tasks by project
const getTasksByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const tasks = await Task_js_1.Task.find({ projectId })
            .populate('assignees', 'name email avatar')
            .populate('reporter', 'name email avatar')
            .sort({ status: 1, priority: -1 });
        res.json({ tasks });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
};
exports.getTasksByProject = getTasksByProject;
//# sourceMappingURL=taskController.js.map