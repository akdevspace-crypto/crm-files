import { QueueOrchestrationService } from '../queue-orchestration/queue-orchestration.service';
export declare class ApiGatewayController {
    private readonly queueOrchestrationService;
    private readonly logger;
    constructor(queueOrchestrationService: QueueOrchestrationService);
    healthCheck(): {
        status: string;
        timestamp: string;
    };
    handleInboundCallFromIVR(payload: {
        customerId: string;
        department: string;
        isEmergency: boolean;
    }): Promise<{
        status: string;
        message: string;
    }>;
}
