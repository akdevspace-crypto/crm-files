"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RecordingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordingService = void 0;
const common_1 = require("@nestjs/common");
let RecordingService = RecordingService_1 = class RecordingService {
    logger = new common_1.Logger(RecordingService_1.name);
    async startRecording(sessionId, transportId) {
        this.logger.log(`Starting FFmpeg recording for session ${sessionId}...`);
    }
    async stopAndUpload(sessionId) {
        this.logger.log(`Stopping recording and uploading to S3/Supabase for session ${sessionId}...`);
        return `https://storage.enterprise.com/records/${sessionId}.mp3`;
    }
};
exports.RecordingService = RecordingService;
exports.RecordingService = RecordingService = RecordingService_1 = __decorate([
    (0, common_1.Injectable)()
], RecordingService);
//# sourceMappingURL=recording.service.js.map