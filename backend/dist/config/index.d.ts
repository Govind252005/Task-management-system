export declare const config: {
    port: string | number;
    nodeEnv: string;
    mongodb: {
        uri: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    email: {
        host: string;
        port: number;
        user: string;
        pass: string;
        from: string;
    };
    urls: {
        frontend: string;
        admin: string;
    };
    geminiApiKey: string;
    openRouterApiKey: string;
    github: {
        clientId: string;
        clientSecret: string;
        callbackUrl: string;
    };
    google: {
        clientId: string;
        clientSecret: string;
        callbackUrl: string;
    };
    slack: {
        botToken: string;
        signingSecret: string;
        clientId: string;
        clientSecret: string;
    };
    rateLimiting: {
        windowMs: number;
        maxRequests: number;
    };
    twoFactor: {
        otpExpiryMinutes: number;
        maxOtpAttempts: number;
        lockoutMinutes: number;
    };
};
export declare const ROLES: {
    readonly ADMIN: "admin";
    readonly MANAGER: "manager";
    readonly TEAM_LEAD: "team_lead";
    readonly EMPLOYEE: "employee";
    readonly VIEWER: "viewer";
};
export type Role = typeof ROLES[keyof typeof ROLES];
export declare const ROLE_HIERARCHY: Record<Role, number>;
export declare const DEPARTMENTS: readonly ["Engineering", "Design", "Marketing", "Sales", "HR", "Finance", "Operations"];
export type Department = typeof DEPARTMENTS[number];
//# sourceMappingURL=index.d.ts.map