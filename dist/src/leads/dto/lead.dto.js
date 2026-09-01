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
exports.CreateLeadNoteDto = exports.LeadStatusUpdateDto = exports.UpdateLeadDto = exports.CreateLeadDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateLeadDto {
    customerName;
    phoneNumber;
    email;
    serviceInterest;
    city;
    notes;
    source;
}
exports.CreateLeadDto = CreateLeadDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bruce Wayne' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+15551234567' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'bruce@wayne.com', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Elderly Care Services', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "serviceInterest", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Gotham', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Needs weekend assistance', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Google Ads', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "source", void 0);
class UpdateLeadDto extends CreateLeadDto {
    status;
    priority;
}
exports.UpdateLeadDto = UpdateLeadDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'IN_PROGRESS', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'HIGH', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "priority", void 0);
class LeadStatusUpdateDto {
    status;
    notes;
}
exports.LeadStatusUpdateDto = LeadStatusUpdateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'CONVERTED' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], LeadStatusUpdateDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Customer called back and agreed to plan', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LeadStatusUpdateDto.prototype, "notes", void 0);
class CreateLeadNoteDto {
    content;
    callId;
}
exports.CreateLeadNoteDto = CreateLeadNoteDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Customer called back and agreed to plan' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLeadNoteDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLeadNoteDto.prototype, "callId", void 0);
//# sourceMappingURL=lead.dto.js.map