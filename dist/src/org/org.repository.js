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
exports.OrgRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OrgRepository = class OrgRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.organization.create({
            data,
        });
    }
    async findById(id) {
        return this.prisma.organization.findUnique({
            where: { id },
            include: { branches: true },
        });
    }
    async update(id, data) {
        return this.prisma.organization.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return this.prisma.organization.delete({
            where: { id },
        });
    }
    async addBranch(orgId, name, address) {
        return this.prisma.branch.create({
            data: {
                organizationId: orgId,
                name,
                address,
            },
        });
    }
    async findBranchById(branchId) {
        return this.prisma.branch.findUnique({
            where: { id: branchId },
        });
    }
    async deleteBranch(branchId) {
        return this.prisma.branch.delete({
            where: { id: branchId },
        });
    }
};
exports.OrgRepository = OrgRepository;
exports.OrgRepository = OrgRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrgRepository);
//# sourceMappingURL=org.repository.js.map