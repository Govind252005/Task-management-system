"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const index_js_1 = require("./config/index.js");
const database_js_1 = require("./config/database.js");
const emailService_js_1 = require("./services/emailService.js");
const socketService_js_1 = require("./services/socketService.js");
const index_js_2 = __importDefault(require("./routes/index.js"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Middleware
const allowedOrigins = [
    index_js_1.config.urls.frontend,
    index_js_1.config.urls.admin,
    'http://localhost:5173',
    'http://localhost:5174',
];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true); // allow tools like curl/postman
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.options('*', (0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// API Routes
app.use('/api', index_js_2.default);
// Root route
app.get('/', (req, res) => {
    res.json({
        name: 'Loom Project Management API',
        version: '1.0.0',
        documentation: '/api/health',
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        ...(index_js_1.config.nodeEnv === 'development' && { stack: err.stack }),
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
// Start server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await (0, database_js_1.connectDatabase)();
        // Verify email connection
        await (0, emailService_js_1.verifyEmailConnection)();
        // Initialize Socket.io
        (0, socketService_js_1.initializeSocket)(httpServer);
        console.log('✅ Socket.io initialized');
        httpServer.listen(index_js_1.config.port, () => {
            console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Loom Backend Server                                  ║
║                                                           ║
║   Server running on: http://localhost:${index_js_1.config.port}              ║
║   Environment: ${index_js_1.config.nodeEnv.padEnd(39)}║
║                                                           ║
║   API Endpoints:                                          ║
║   • Auth:          /api/auth                              ║
║   • Users:         /api/users                             ║
║   • Tasks:         /api/tasks                             ║
║   • Projects:      /api/projects                          ║
║   • Sprints:       /api/sprints                           ║
║   • Notifications: /api/notifications                     ║
║   • Reports:       /api/reports                           ║
║   • Activities:    /api/activities                        ║
║   • Labels:        /api/labels                            ║
║   • Search:        /api/search                            ║
║   • Uploads:       /api/uploads                           ║
║   • WebSocket:     ws://localhost:${index_js_1.config.port}                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map