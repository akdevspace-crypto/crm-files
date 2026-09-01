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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const user_repository_1 = require("./user.repository");
let UserService = class UserService {
    userRepo;
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async getAllUsers() {
        return this.userRepo.findAll();
    }
    async getUserById(id) {
        const user = await this.userRepo.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User profile not found');
        }
        return user;
    }
    async updateUser(id, dto) {
        const user = await this.getUserById(id);
        if (dto.reportingManagerId === id) {
            throw new common_1.BadRequestException('Reporting hierarchy error: A user cannot report to themselves.');
        }
        return this.userRepo.updateAgentProfile(id, {
            name: dto.name,
            department: dto.department,
            extension: dto.extension,
        });
    }
    async assignUserRole(id, dto) {
        await this.getUserById(id);
        return this.userRepo.assignRole(id, dto.roleId);
    }
    async revokeUserRole(id, roleId) {
        await this.getUserById(id);
        return this.userRepo.removeRole(id, roleId);
    }
    async toggleUserStatus(id, dto) {
        await this.getUserById(id);
        return this.userRepo.updateStatus(id, dto.isActive);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repository_1.UserRepository])
], UserService);
//# sourceMappingURL=user.service.js.map