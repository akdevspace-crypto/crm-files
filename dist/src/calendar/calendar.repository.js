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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CalendarRepository = class CalendarRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOrCreateCalendar(agentId) {
        let calendar = await this.prisma.calendar.findUnique({
            where: { agentId },
        });
        if (!calendar) {
            calendar = await this.prisma.calendar.create({
                data: {
                    agentId,
                },
            });
        }
        return calendar;
    }
    async findMany(calendarId) {
        return this.prisma.appointment.findMany({
            where: { calendarId },
            include: {
                customer: true,
            },
            orderBy: { startTime: 'asc' },
        });
    }
    async findAll() {
        return this.prisma.appointment.findMany({
            include: {
                customer: true,
            },
            orderBy: { startTime: 'asc' },
        });
    }
    async findByUserId(userId) {
        const agent = await this.prisma.agent.findUnique({
            where: { userId },
        });
        if (!agent)
            return [];
        const calendar = await this.findOrCreateCalendar(agent.id);
        return this.findMany(calendar.id);
    }
    async findById(id) {
        return this.prisma.appointment.findUnique({
            where: { id },
        });
    }
    async create(calendarId, customerId, data) {
        return this.prisma.appointment.create({
            data: {
                calendarId,
                customerId,
                title: data.title,
                type: data.type || 'MEETING',
                startTime: data.startTime,
                endTime: data.endTime,
                status: data.status || 'SCHEDULED',
            },
        });
    }
    async createWithUserId(userId, customerId, data) {
        const agent = await this.prisma.agent.findUnique({
            where: { userId },
        });
        if (!agent) {
            throw new Error('Agent profile not found for this user');
        }
        const calendar = await this.findOrCreateCalendar(agent.id);
        return this.create(calendar.id, customerId, data);
    }
    async update(id, data) {
        return this.prisma.appointment.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return this.prisma.appointment.delete({
            where: { id },
        });
    }
};
exports.CalendarRepository = CalendarRepository;
exports.CalendarRepository = CalendarRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CalendarRepository);
//# sourceMappingURL=calendar.repository.js.map