export declare class RecordingService {
    private readonly logger;
    startRecording(sessionId: string, transportId: string): Promise<void>;
    stopAndUpload(sessionId: string): Promise<string>;
}
