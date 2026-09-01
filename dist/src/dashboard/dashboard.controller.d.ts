import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboardAnalytics(type: string, query: DashboardQueryDto): Promise<{
        kpis: {
            label: string;
            value: string;
            change: string;
            isPositive: boolean;
        }[];
        charts: {
            revenueTrend: {
                name: string;
                value: number;
            }[];
            departmentPerformance: {
                name: string;
                value: number;
            }[];
            salesFunnel?: undefined;
            pipelineTrend?: undefined;
            sourceShare?: undefined;
            callsPerHour?: undefined;
        };
        reports?: undefined;
    } | {
        kpis: {
            label: string;
            value: string;
            change: string;
            isPositive: boolean;
        }[];
        charts: {
            revenueTrend: {
                name: string;
                value: number;
            }[];
            salesFunnel: {
                name: string;
                value: number;
            }[];
            departmentPerformance: {
                name: string;
                value: number;
            }[];
            pipelineTrend?: undefined;
            sourceShare?: undefined;
            callsPerHour?: undefined;
        };
        reports?: undefined;
    } | {
        kpis: {
            label: string;
            value: string;
            change: string;
            isPositive: boolean;
        }[];
        charts: {
            pipelineTrend: {
                name: string;
                value: number;
            }[];
            sourceShare: {
                name: string;
                value: number;
            }[];
            revenueTrend?: undefined;
            departmentPerformance?: undefined;
            salesFunnel?: undefined;
            callsPerHour?: undefined;
        };
        reports?: undefined;
    } | {
        kpis: {
            label: string;
            value: string;
            change: string;
            isPositive: boolean;
        }[];
        charts: {
            callsPerHour: {
                name: string;
                value: number;
            }[];
            departmentPerformance: {
                name: string;
                value: number;
            }[];
            revenueTrend?: undefined;
            salesFunnel?: undefined;
            pipelineTrend?: undefined;
            sourceShare?: undefined;
        };
        reports?: undefined;
    } | {
        kpis: {
            label: string;
            value: string;
            change: string;
            isPositive: boolean;
        }[];
        charts: {
            callsPerHour: {
                name: string;
                value: number;
            }[];
            revenueTrend?: undefined;
            departmentPerformance?: undefined;
            salesFunnel?: undefined;
            pipelineTrend?: undefined;
            sourceShare?: undefined;
        };
        reports?: undefined;
    } | {
        kpis: {
            label: string;
            value: string;
            change: string;
            isPositive: boolean;
        }[];
        charts: {
            sourceShare: {
                name: string;
                value: number;
            }[];
            revenueTrend?: undefined;
            departmentPerformance?: undefined;
            salesFunnel?: undefined;
            pipelineTrend?: undefined;
            callsPerHour?: undefined;
        };
        reports?: undefined;
    } | {
        kpis: {
            label: string;
            value: string;
            change: string;
            isPositive: boolean;
        }[];
        charts: {
            pipelineTrend: {
                name: string;
                value: number;
            }[];
            revenueTrend?: undefined;
            departmentPerformance?: undefined;
            salesFunnel?: undefined;
            sourceShare?: undefined;
            callsPerHour?: undefined;
        };
        reports?: undefined;
    } | {
        reports: {
            id: string;
            name: string;
            fields: string[];
        }[];
        kpis?: undefined;
        charts?: undefined;
    } | {
        kpis: never[];
        charts: {
            revenueTrend?: undefined;
            departmentPerformance?: undefined;
            salesFunnel?: undefined;
            pipelineTrend?: undefined;
            sourceShare?: undefined;
            callsPerHour?: undefined;
        };
        reports?: undefined;
    }>;
}
