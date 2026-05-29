export function sendEmailReply(toEmail: any, subject: any, htmlBody: any, inReplyTo: any, references: any): Promise<{
    success: boolean;
    messageId: any;
    error?: undefined;
} | {
    success: boolean;
    error: any;
    messageId?: undefined;
}>;
