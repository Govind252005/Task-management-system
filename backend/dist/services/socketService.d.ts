import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
export declare const initializeSocket: (httpServer: HttpServer) => Server;
export declare const getIO: () => Server;
export declare const emitToUser: (userId: string, event: string, data: any) => void;
export declare const emitToProject: (projectId: string, event: string, data: any) => void;
export declare const emitToAll: (event: string, data: any) => void;
//# sourceMappingURL=socketService.d.ts.map