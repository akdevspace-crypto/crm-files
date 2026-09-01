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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgController = void 0;
const common_1 = require("@nestjs/common");
const org_service_1 = require("./org.service");
const org_dto_1 = require("./dto/org.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const rbac_guard_1 = require("../auth/rbac.guard");
const permissions_decorator_1 = require("../auth/permissions.decorator");
const swagger_1 = require("@nestjs/swagger");
let OrgController = class OrgController {
    orgService;
    constructor(orgService) {
        this.orgService = orgService;
    }
    async getOrg(id) {
        return this.orgService.getOrganization(id);
    }
    async updateOrg(id, dto) {
        return this.orgService.updateOrganization(id, dto);
    }
    async addBranch(orgId, dto) {
        return this.orgService.createBranch(orgId, dto);
    }
    async removeBranch(branchId) {
        return this.orgService.removeBranch(branchId);
    }
};
exports.OrgController = OrgController;
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Retrieve organization metadata and branches' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrgController.prototype, "getOrg", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('Org.Update'),
    (0, swagger_1.ApiOperation)({ summary: 'Update organization core business hours and settings' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, org_dto_1.UpdateOrgDto]),
    __metadata("design:returntype", Promise)
], OrgController.prototype, "updateOrg", null);
__decorate([
    (0, common_1.Post)(':orgId/branches'),
    (0, permissions_decorator_1.RequirePermissions)('Org.Update'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a new corporate branch location' }),
    __param(0, (0, common_1.Param)('orgId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, org_dto_1.CreateBranchDto]),
    __metadata("design:returntype", Promise)
], OrgController.prototype, "addBranch", null);
__decorate([
    (0, common_1.Delete)('branches/:branchId'),
    (0, permissions_decorator_1.RequirePermissions)('Org.Update'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a branch location' }),
    __param(0, (0, common_1.Param)('branchId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrgController.prototype, "removeBranch", null);
exports.OrgController = OrgController = __decorate([
    (0, swagger_1.ApiTags)('organizations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    (0, common_1.Controller)('organizations'),
    __metadata("design:paramtypes", [org_service_1.OrgService])
], OrgController);
//# sourceMappingURL=org.controller.js.map