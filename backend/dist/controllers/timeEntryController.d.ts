import { Request, Response } from 'express';
export declare const getTaskTimeEntries: (req: Request, res: Response) => Promise<void>;
export declare const getUserTimeEntries: (req: Request, res: Response) => Promise<void>;
export declare const startTimer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const stopTimer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCurrentTimer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createManualEntry: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateTimeEntry: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteTimeEntry: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getProjectTimeReport: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=timeEntryController.d.ts.map