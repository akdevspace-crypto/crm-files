import { PrismaService } from '../prisma/prisma.service';
export declare class CalendarCronService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleCron(): Promise<void>;
}
