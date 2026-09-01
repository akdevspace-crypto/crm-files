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
exports.OrgService = void 0;
const common_1 = require("@nestjs/common");
const org_repository_1 = require("./org.repository");
let OrgService = class OrgService {
    orgRepo;
    constructor(orgRepo) {
        this.orgRepo = orgRepo;
    }
    async createOrganization(dto) {
        return this.orgRepo.create({
            name: dto.name,
            gstNumber: dto.gstNumber,
            address: dto.address,
            city: dto.city,
            country: dto.country,
            timezone: dto.timezone,
            businessHours: dto.businessHours,
        });
    }
    async getOrganization(id) {
        const org = await this.orgRepo.findById(id);
        if (!org) {
            throw new common_1.NotFoundException('Organization settings not found');
        }
        return org;
    }
    async updateOrganization(id, dto) {
        await this.getOrganization(id);
        return this.orgRepo.update(id, dto);
    }
    async deleteOrganization(id) {
        await this.getOrganization(id);
        return this.orgRepo.delete(id);
    }
    async createBranch(orgId, dto) {
        await this.getOrganization(orgId);
        return this.orgRepo.addBranch(orgId, dto.name, dto.address);
    }
    async removeBranch(branchId) {
        const branch = await this.orgRepo.findBranchById(branchId);
        if (!branch) {
            throw new common_1.NotFoundException('Branch not found');
        }
        return this.orgRepo.deleteBranch(branchId);
    }
};
exports.OrgService = OrgService;
exports.OrgService = OrgService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [org_repository_1.OrgRepository])
], OrgService);
//# sourceMappingURL=org.service.js.map