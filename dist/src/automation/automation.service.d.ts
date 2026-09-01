import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
export declare class AutomationService {
    private readonly prisma;
    private readonly eventEmitter;
    private readonly logger;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    handleAllEvents(event: string, payload: any): Promise<void>;
    private executeRule;
}
