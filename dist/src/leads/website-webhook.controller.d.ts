import { LeadsService } from './leads.service';
export declare class WebsiteWebhookController {
    private readonly leadsService;
    constructor(leadsService: LeadsService);
    handleWebsiteEnquiry(body: any): Promise<{
        success: boolean;
        leadId: string;
    }>;
}
