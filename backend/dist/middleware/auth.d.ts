import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Role } from '../config/index.js';
import { IUser } from '../models/User.js';
export interface UserWithId extends IUser {
    _id: mongoose.Types.ObjectId;
}
declare global {
    namespace Express {
        interface Request {
            user?: UserWithId;
        }
    }
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (...allowedRoles: Role[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const authorizeMinRole: (minRole: Role) => (req: Request, res: Response, next: NextFunction) => void;
export declare const authorizeResourceAccess: (resourceUserIdField?: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const adminOnly: (req: Request, res: Response, next: NextFunction) => void;
export declare const managerAndAbove: (req: Request, res: Response, next: NextFunction) => void;
export declare const teamLeadAndAbove: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map