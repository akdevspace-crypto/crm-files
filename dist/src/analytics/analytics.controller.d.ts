import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getDashboardMetrics(): Promise<{
        success: boolean;
        totalCalls: number;
        claimedLeads: number;
        convertedLeads: number;
        positiveLeads: number;
        conversionRate: number;
        metrics: {
            totalCalls: number;
            avgHandleTime: string;
            slaBreachRate: string;
            queueSize: number;
            activeTickets: number;
            occupancyRate: string;
            csatScore: string;
        };
    }>;
}
