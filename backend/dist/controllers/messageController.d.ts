import { Request, Response } from 'express';
export declare const getConversations: (req: Request, res: Response) => Promise<void>;
export declare const createConversation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMessages: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const sendMessage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createTaskGroupConversation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const markConversationRead: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateMessage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteMessage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=messageController.d.ts.map