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
exports.CalendarService = void 0;
const common_1 = require("@nestjs/common");
const calendar_repository_1 = require("./calendar.repository");
let CalendarService = class CalendarService {
    calendarRepo;
    constructor(calendarRepo) {
        this.calendarRepo = calendarRepo;
    }
    async getAgentEvents(userId, role) {
        if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'SUPERVISOR') {
            return this.calendarRepo.findAll();
        }
        return this.calendarRepo.findByUserId(userId);
    }
    async createEvent(userId, dto) {
        return this.calendarRepo.createWithUserId(userId, dto.customerId, {
            title: dto.title,
            type: dto.type,
            startTime: new Date(dto.startTime),
            endTime: new Date(dto.endTime),
            status: dto.status,
        });
    }
    async updateEvent(eventId, dto) {
        const event = await this.calendarRepo.findById(eventId);
        if (!event) {
            throw new common_1.NotFoundException('Calendar event not found');
        }
        return this.calendarRepo.update(eventId, {
            title: dto.title,
            startTime: new Date(dto.startTime),
            endTime: new Date(dto.endTime),
            status: dto.status,
        });
    }
    async deleteEvent(eventId) {
        const event = await this.calendarRepo.findById(eventId);
        if (!event) {
            throw new common_1.NotFoundException('Calendar event not found');
        }
        return this.calendarRepo.delete(eventId);
    }
};
exports.CalendarService = CalendarService;
exports.CalendarService = CalendarService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [calendar_repository_1.CalendarRepository])
], CalendarService);
//# sourceMappingURL=calendar.service.js.map