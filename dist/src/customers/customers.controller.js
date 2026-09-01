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
exports.CustomersController = void 0;
const common_1 = require("@nestjs/common");
const customers_service_1 = require("./customers.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const rbac_guard_1 = require("../auth/rbac.guard");
let CustomersController = class CustomersController {
    customersService;
    constructor(customersService) {
        this.customersService = customersService;
    }
    async mergeCustomers(primaryId, duplicateId, req) {
        const allowedRoles = ['SUPER_ADMIN', 'ADMIN'];
        if (!allowedRoles.includes(req.user?.role)) {
            throw new common_1.ForbiddenException('Insufficient role permissions');
        }
        return this.customersService.mergeCustomers(primaryId, duplicateId, req.user.id);
    }
};
exports.CustomersController = CustomersController;
__decorate([
    (0, common_1.Post)('merge'),
    __param(0, (0, common_1.Body)('primaryId')),
    __param(1, (0, common_1.Body)('duplicateId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "mergeCustomers", null);
exports.CustomersController = CustomersController = __decorate([
    (0, common_1.Controller)('v1/customers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, rbac_guard_1.RbacGuard),
    __metadata("design:paramtypes", [customers_service_1.CustomersService])
], CustomersController);
//# sourceMappingURL=customers.controller.js.map