"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelephonyModule = void 0;
const common_1 = require("@nestjs/common");
const telephony_service_1 = require("./telephony.service");
const livekit_service_1 = require("./livekit.service");
const telephony_gateway_1 = require("./telephony.gateway");
const telephony_controller_1 = require("./telephony.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const queue_orchestration_module_1 = require("../queue-orchestration/queue-orchestration.module");
let TelephonyModule = class TelephonyModule {
};
exports.TelephonyModule = TelephonyModule;
exports.TelephonyModule = TelephonyModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, queue_orchestration_module_1.QueueOrchestrationModule],
        controllers: [telephony_controller_1.TelephonyController],
        providers: [telephony_service_1.TelephonyService, livekit_service_1.LivekitService, telephony_gateway_1.TelephonyGateway],
        exports: [telephony_service_1.TelephonyService, livekit_service_1.LivekitService],
    })
], TelephonyModule);
//# sourceMappingURL=telephony.module.js.map