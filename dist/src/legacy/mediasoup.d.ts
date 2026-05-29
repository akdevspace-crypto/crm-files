export function initMediasoup(): Promise<void>;
export function getRouterRtpCapabilities(): Promise<any>;
export function createWebRtcTransport(): Promise<any>;
export function startRecording(callSid: any, producer: any): Promise<void>;
export function stopRecordingAndUpload(callSid: any): Promise<any>;
export declare function getRouter(): any;
