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
var InstagramEnrichmentProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramEnrichmentProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const instagram_enrichment_service_1 = require("./instagram-enrichment.service");
let InstagramEnrichmentProcessor = InstagramEnrichmentProcessor_1 = class InstagramEnrichmentProcessor extends bullmq_1.WorkerHost {
    enrichmentService;
    logger = new common_1.Logger(InstagramEnrichmentProcessor_1.name);
    constructor(enrichmentService) {
        super();
        this.enrichmentService = enrichmentService;
    }
    async process(job) {
        const { customerId, platformUserId } = job.data;
        this.logger.log(`Processing instagram-enrichment job ${job.id} (Customer: ${customerId}, IGSID: ${platformUserId})`);
        try {
            const profile = await this.enrichmentService.enrichProfile(customerId, platformUserId);
            return { success: true, username: profile.username };
        }
        catch (err) {
            this.logger.error(`Job ${job.id} failed: ${err.message}`);
            throw err;
        }
    }
};
exports.InstagramEnrichmentProcessor = InstagramEnrichmentProcessor;
exports.InstagramEnrichmentProcessor = InstagramEnrichmentProcessor = InstagramEnrichmentProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('instagram-enrichment'),
    __metadata("design:paramtypes", [instagram_enrichment_service_1.InstagramProfileEnrichmentService])
], InstagramEnrichmentProcessor);
//# sourceMappingURL=instagram-enrichment.processor.js.map