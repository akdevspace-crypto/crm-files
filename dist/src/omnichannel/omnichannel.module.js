"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OmnichannelModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const prisma_module_1 = require("../prisma/prisma.module");
const redis_module_1 = require("../redis/redis.module");
const instagram_enrichment_service_1 = require("./instagram-enrichment.service");
const instagram_enrichment_processor_1 = require("./instagram-enrichment.processor");
let OmnichannelModule = class OmnichannelModule {
};
exports.OmnichannelModule = OmnichannelModule;
exports.OmnichannelModule = OmnichannelModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            bullmq_1.BullModule.registerQueue({
                name: 'instagram-enrichment',
            }),
        ],
        providers: [instagram_enrichment_service_1.InstagramProfileEnrichmentService, instagram_enrichment_processor_1.InstagramEnrichmentProcessor],
        exports: [instagram_enrichment_service_1.InstagramProfileEnrichmentService],
    })
], OmnichannelModule);
//# sourceMappingURL=omnichannel.module.js.map