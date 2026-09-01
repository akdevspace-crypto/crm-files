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
var OmnichannelController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OmnichannelController = void 0;
const common_1 = require("@nestjs/common");
const voice_assistant_service_1 = require("./voice-assistant.service");
let OmnichannelController = OmnichannelController_1 = class OmnichannelController {
    voiceAssistantService;
    logger = new common_1.Logger(OmnichannelController_1.name);
    constructor(voiceAssistantService) {
        this.voiceAssistantService = voiceAssistantService;
    }
    async handleMockVoiceMessage(body) {
        this.logger.log(`Received mock voice message for conv: ${body.conversationId}`);
        this.voiceAssistantService.processIncomingVoiceMessage(body.conversationId, body.audioUrl)
            .catch(err => this.logger.error(`Error in voice pipeline: ${err.message}`));
        return { success: true, message: 'Voice message received and processing started.' };
    }
};
exports.OmnichannelController = OmnichannelController;
__decorate([
    (0, common_1.Post)('mock-voice-message'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OmnichannelController.prototype, "handleMockVoiceMessage", null);
exports.OmnichannelController = OmnichannelController = OmnichannelController_1 = __decorate([
    (0, common_1.Controller)('omnichannel'),
    __metadata("design:paramtypes", [voice_assistant_service_1.VoiceAssistantService])
], OmnichannelController);
//# sourceMappingURL=omnichannel.controller.js.map