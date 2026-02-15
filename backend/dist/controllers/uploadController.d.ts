import { Request, Response } from 'express';
import multer from 'multer';
export declare const upload: multer.Multer;
export declare const uploadFile: (req: Request, res: Response) => Promise<void>;
export declare const getTaskAttachments: (req: Request, res: Response) => Promise<void>;
export declare const deleteAttachment: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=uploadController.d.ts.map