import { Request, Response } from 'express';
export declare const getTaskSuggestions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getScheduleSuggestions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getProductivityInsights: (req: Request, res: Response) => Promise<void>;
export declare const getBurndownPrediction: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const generateTaskDescription: (req: Request, res: Response) => Promise<void>;
export declare const categorizeTask: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=aiController.d.ts.map