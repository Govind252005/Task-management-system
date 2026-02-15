import { Request, Response } from 'express';
export declare const getTaskChecklists: (req: Request, res: Response) => Promise<void>;
export declare const createChecklist: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateChecklist: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteChecklist: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const addChecklistItem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateChecklistItem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteChecklistItem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const toggleChecklistItem: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const reorderChecklistItems: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=checklistController.d.ts.map