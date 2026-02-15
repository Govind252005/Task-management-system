import { IReport, ReportType, IReportData } from '../models/Report.js';
import { IUser } from '../models/User.js';
interface DateRange {
    start: Date;
    end: Date;
}
export declare const generateIndividualReport: (userId: string, dateRange: DateRange) => Promise<IReportData>;
export declare const generateTeamReport: (managerId: string, dateRange: DateRange) => Promise<IReportData>;
export declare const generateProjectReport: (projectId: string, dateRange: DateRange) => Promise<IReportData>;
export declare const generateDepartmentReport: (department: string, dateRange: DateRange) => Promise<IReportData>;
export declare const generateOrganizationReport: (dateRange: DateRange) => Promise<IReportData>;
export declare const generateDailyProgress: (tasks: any[], dateRange: DateRange) => Promise<{
    date: string;
    completed: number;
}[]>;
export declare const saveReport: (userId: string, reportType: ReportType, targetId: string | null, dateRange: DateRange, data: IReportData, charts: any) => Promise<IReport>;
export declare const getAccessibleReports: (user: IUser) => Promise<ReportType[]>;
export declare const getDashboardData: (user: any, dateRange: DateRange) => Promise<any>;
export {};
//# sourceMappingURL=reportService.d.ts.map