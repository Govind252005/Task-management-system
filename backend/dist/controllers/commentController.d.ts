import { Request, Response } from 'express';
export declare const getTaskComments: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCommentReplies: (req: Request, res: Response) => Promise<void>;
export declare const createComment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateComment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteComment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const addReaction: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const searchMentionableUsers: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=commentController.d.ts.map