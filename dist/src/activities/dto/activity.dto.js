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
exports.CreateCommentDto = exports.CreateActivityDto = exports.ActivityType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var ActivityType;
(function (ActivityType) {
    ActivityType["CALL"] = "CALL";
    ActivityType["MEETING"] = "MEETING";
    ActivityType["EMAIL"] = "EMAIL";
    ActivityType["TASK"] = "TASK";
    ActivityType["WHATSAPP"] = "WHATSAPP";
    ActivityType["SITE_VISIT"] = "SITE_VISIT";
})(ActivityType || (exports.ActivityType = ActivityType = {}));
class CreateActivityDto {
    type;
    subject;
    description;
    dueDate;
    status;
    customerId;
    leadId;
}
exports.CreateActivityDto = CreateActivityDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ActivityType, example: 'CALL' }),
    (0, class_validator_1.IsEnum)(ActivityType),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Discussed premium pricing options' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Customer called to request a price quotation', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-21T10:00:00Z', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PENDING', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Linked Customer ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Linked Lead ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateActivityDto.prototype, "leadId", void 0);
class CreateCommentDto {
    content;
}
exports.CreateCommentDto = CreateCommentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Supervisor feedback: Pricing approved.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "content", void 0);
//# sourceMappingURL=activity.dto.js.map