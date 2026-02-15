"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitToAll = exports.emitToProject = exports.emitToUser = exports.getIO = exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_js_1 = require("../config/index.js");
let io;
const initializeSocket = (httpServer) => {
    const allowedOrigins = [
        index_js_1.config.urls.frontend,
        index_js_1.config.urls.admin,
        'http://localhost:5173',
        'http://localhost:5174',
    ].filter(Boolean);
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
        },
    });
    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const authHeader = socket.handshake.headers.authorization;
            const bearer = Array.isArray(authHeader) ? authHeader[0] : authHeader;
            const tokenFromHeader = typeof bearer === 'string' ? bearer.replace(/^Bearer\s+/i, '') : undefined;
            const authPayload = typeof socket.handshake.auth === 'object' && socket.handshake.auth !== null
                ? socket.handshake.auth
                : undefined;
            const tokenFromAuth = authPayload?.token;
            const token = typeof tokenFromAuth === 'string' && tokenFromAuth
                ? tokenFromAuth
                : tokenFromHeader;
            if (!token) {
                return next(new Error('Authentication required'));
            }
            const decoded = jsonwebtoken_1.default.verify(token, index_js_1.config.jwt.secret);
            socket.userId = decoded.userId;
            socket.userRole = decoded.role;
            next();
        }
        catch (error) {
            next(new Error('Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId}`);
        // Join user's personal room for notifications
        if (socket.userId) {
            socket.join(`user:${socket.userId}`);
        }
        // Allow client to rejoin explicitly if needed
        socket.on('join:user', (uid) => {
            if (!uid)
                return;
            socket.join(`user:${uid}`);
        });
        // Join project rooms
        socket.on('join:project', (projectId) => {
            socket.join(`project:${projectId}`);
        });
        socket.on('leave:project', (projectId) => {
            socket.leave(`project:${projectId}`);
        });
        // Handle task updates in real-time
        socket.on('task:update', (data) => {
            // Broadcast to project room
            if (data.projectId) {
                socket.to(`project:${data.projectId}`).emit('task:updated', data);
            }
        });
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
        });
    });
    return io;
};
exports.initializeSocket = initializeSocket;
// Get the io instance
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};
exports.getIO = getIO;
// Emit notification to specific user
const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
};
exports.emitToUser = emitToUser;
// Emit to all users in a project
const emitToProject = (projectId, event, data) => {
    if (io) {
        io.to(`project:${projectId}`).emit(event, data);
    }
};
exports.emitToProject = emitToProject;
// Emit to all connected users
const emitToAll = (event, data) => {
    if (io) {
        io.emit(event, data);
    }
};
exports.emitToAll = emitToAll;
//# sourceMappingURL=socketService.js.map