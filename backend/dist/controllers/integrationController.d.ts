import { Request, Response } from 'express';
export declare const getIntegrations: (req: Request, res: Response) => Promise<void>;
export declare const connectGitHub: (req: Request, res: Response) => Promise<void>;
export declare const githubCallback: (req: Request, res: Response) => Promise<void>;
export declare const getGitHubRepos: (req: Request, res: Response) => Promise<void>;
export declare const linkGitHubRepo: (req: Request, res: Response) => Promise<void>;
export declare const connectGoogleCalendar: (req: Request, res: Response) => Promise<void>;
export declare const googleCallback: (req: Request, res: Response) => Promise<void>;
export declare const getGoogleCalendars: (req: Request, res: Response) => Promise<void>;
export declare const getSlackChannels: (req: Request, res: Response) => Promise<void>;
export declare const updateIntegration: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const disconnectIntegration: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const testIntegration: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=integrationController.d.ts.map