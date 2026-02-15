import { Request, Response } from 'express';
export declare const get2FAStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const setup2FA: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const enable2FA: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const disable2FA: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const sendLoginOTP: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const verifyLoginOTP: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const regenerateBackupCodes: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const removeTrustedDevice: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getTrustedDevices: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=twoFactorController.d.ts.map