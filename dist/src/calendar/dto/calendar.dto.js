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
exports.UpdateEventDto = exports.CreateEventDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateEventDto {
    title;
    startTime;
    endTime;
    customerId;
    status;
    type;
    externalSync;
}
exports.CreateEventDto = CreateEventDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Discuss service plan options' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-21T10:00:00Z' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-05-21T11:00:00Z' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'fc75cbca-5a45-46e9-9905-521d708e5ebe', description: 'Linked Customer ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SCHEDULED', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MEETING', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Outlook/Google calendar sync status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateEventDto.prototype, "externalSync", void 0);
class UpdateEventDto extends CreateEventDto {
}
exports.UpdateEventDto = UpdateEventDto;
//# sourceMappingURL=calendar.dto.js.map