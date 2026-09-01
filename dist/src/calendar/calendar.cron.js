"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CalendarCronService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarCronService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
let CalendarCronService = CalendarCronService_1 = class CalendarCronService {
    prisma;
    logger = new common_1.Logger(CalendarCronService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async handleCron() {
        this.logger.log('Running Calendar Reminders Cron Job...');
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        const upcomingAppointments = await this.prisma.appointment.findMany({
            where: {
                startTime: {
                    gte: now,
                    lte: oneHourFromNow,
                },
                status: 'SCHEDULED',
            },
            include: {
                calendar: {
                    include: { agent: true },
                },
                customer: true,
            },
        });
        for (const appointment of upcomingAppointments) {
            this.logger.log(`Reminder: Appointment '${appointment.title}' with ${appointment.customer?.name} at ${appointment.startTime}. Assigned to ${appointment.calendar.agent.name}.`);
            await this.prisma.leadNotification.create({
                data: {
                    leadId: null,
                    type: 'REMINDER',
                    channel: 'IN_APP',
                    content: `Reminder: Appointment '${appointment.title}' in 1 hour.`,
                    status: 'SENT',
                    sentAt: new Date(),
                },
            }).catch(() => null);
        }
        const upcomingFollowups = await this.prisma.leadFollowup.findMany({
            where: {
                followupDate: {
                    gte: now,
                    lte: oneHourFromNow,
                },
                status: 'PENDING',
            },
            include: {
                lead: true,
                assignedAgent: true,
            },
        });
        for (const followup of upcomingFollowups) {
            this.logger.log(`Reminder: Followup for Lead '${followup.lead.customerName}' at ${followup.followupDate}. Assigned to ${followup.assignedAgent.name}.`);
            try {
                await this.prisma.leadNotification.create({
                    data: {
                        leadId: followup.leadId,
                        type: 'REMINDER',
                        channel: 'IN_APP',
                        content: `Reminder: Followup with ${followup.lead.customerName} in 1 hour.`,
                        status: 'SENT',
                        sentAt: new Date(),
                    },
                });
            }
            catch (e) {
                this.logger.error('Failed to log lead notification', e);
            }
        }
    }
};
exports.CalendarCronService = CalendarCronService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CalendarCronService.prototype, "handleCron", null);
exports.CalendarCronService = CalendarCronService = CalendarCronService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CalendarCronService);
//# sourceMappingURL=calendar.cron.js.map