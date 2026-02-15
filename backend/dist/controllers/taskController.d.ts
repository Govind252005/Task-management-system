import { Request, Response } from 'express';
export declare const getAllTasks: (req: Request, res: Response) => Promise<void>;
export declare const getTaskById: (req: Request, res: Response) => Promise<void>;
export declare const createTask: (req: Request, res: Response) => Promise<void>;
export declare const updateTask: (req: Request, res: Response) => Promise<void>;
export declare const deleteTask: (req: Request, res: Response) => Promise<void>;
export declare const updateTaskStatus: (req: Request, res: Response) => Promise<void>;
export declare const updateTaskAssignees: (req: Request, res: Response) => Promise<void>;
export declare const addComment: (req: Request, res: Response) => Promise<void>;
export declare const getMyTasks: (req: Request, res: Response) => Promise<void>;
export declare const getTasksByProject: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=taskController.d.ts.map