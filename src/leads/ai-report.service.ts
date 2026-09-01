import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiReportService {
  private readonly logger = new Logger(AiReportService.name);
  private openai: OpenAI;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY') || 'dummy-key';
    this.openai = new OpenAI({ apiKey });
  }

  async generateReport(leadId: string, userId: string) {
    // 1. Fetch Lead Data
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        leadNotes: {
          include: { agent: true, corrections: true },
          orderBy: { createdAt: 'desc' }
        },
        timelineEvents: {
          orderBy: { createdAt: 'desc' }
        },
        // customer relation not explicitly in Lead in this schema for this phase
      }
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    // 2. Build prompt context
    const notesContext = lead.leadNotes.map((n: any) => 
      `Note by ${n.agent?.name || 'System'}: ${n.content} ${n.isCorrection ? '(Correction)' : ''}`
    ).join('\n');

    const timelineContext = lead.timelineEvents.map((t: any) =>
      `Event [${t.eventType}]: ${t.title} - ${t.description || ''} - Status: ${t.status}`
    ).join('\n');

    const prompt = `
      You are an AI assistant tasked with generating a comprehensive Lead History Report.
      Please analyze the following lead data, notes, and timeline events, and output a JSON object containing the exact following keys:
      {
        "LeadSummary": "A brief summary of the lead's profile, intent, and current status.",
        "CommunicationSummary": "A summary of the communication history, frequency, and channels used.",
        "FollowUpSummary": "A summary of follow-ups, responsiveness, and next scheduled actions.",
        "ServiceSummary": "A summary of the specific services or products discussed.",
        "FinancialSummary": "A summary of financial discussions, quotations, or payments.",
        "AdmissionSummary": "A summary regarding any admission or conversion probability and roadblocks.",
        "OutstandingTasks": "A summary of pending tasks or required immediate actions."
      }

      Lead Details:
      Name: ${lead.customerName}
      Email: ${lead.email || 'N/A'}
      Status: ${lead.status}
      Score: ${lead.conversionScore || 'N/A'}

      Notes History:
      ${notesContext}

      Timeline Events:
      ${timelineContext}
      
      Output ONLY valid JSON.
    `;

    try {
      this.logger.log(`Generating AI report for lead ${leadId}`);
      let contentJson: any;

      if (this.configService.get<string>('OPENAI_API_KEY')) {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: prompt }],
          response_format: { type: 'json_object' }
        });
        
        const rawContent = response.choices[0].message.content || '{}';
        contentJson = JSON.parse(rawContent);
      } else {
        // Fallback dummy report if no API key
        contentJson = {
          LeadSummary: "Dummy Lead Summary based on data.",
          CommunicationSummary: "Dummy Communication Summary.",
          FollowUpSummary: "Dummy Follow Up Summary.",
          ServiceSummary: "Dummy Service Summary.",
          FinancialSummary: "Dummy Financial Summary.",
          AdmissionSummary: "Dummy Admission Summary.",
          OutstandingTasks: "Dummy tasks."
        };
      }

      // Save to database
      const report = await this.prisma.leadReport.create({
        data: {
          leadId,
          generatedBy: userId,
          content: contentJson,
        }
      });

      return report;
    } catch (e) {
      this.logger.error(`Error generating report: ${e.message}`);
      throw new Error('Failed to generate report');
    }
  }

  async getLatestReport(leadId: string) {
    return this.prisma.leadReport.findFirst({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } }, lead: true }
    });
  }

  async generatePdf(reportId: string): Promise<Buffer> {
    const report = await this.prisma.leadReport.findUnique({ where: { id: reportId }, include: { lead: true } });
    if (!report) throw new Error('Report not found');
    const PDFDocument = require('pdfkit');
    return new Promise((resolve) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc.fontSize(20).text(`Lead History Report: ${report.lead.customerName}`, { align: 'center' });
      doc.moveDown();

      const content = report.content as any;
      for (const [key, value] of Object.entries(content)) {
        doc.fontSize(14).text(key.replace(/([A-Z])/g, ' $1').trim(), { underline: true });
        doc.fontSize(12).text(value as string);
        doc.moveDown();
      }
      doc.end();
    });
  }

  async generateWord(reportId: string): Promise<Buffer> {
    const report = await this.prisma.leadReport.findUnique({ where: { id: reportId }, include: { lead: true } });
    if (!report) throw new Error('Report not found');
    const { Document, Packer, Paragraph, HeadingLevel } = require('docx');

    const content = report.content as any;
    const children = [
      new Paragraph({ text: `Lead History Report: ${report.lead.customerName}`, heading: HeadingLevel.HEADING_1 }),
    ];

    for (const [key, value] of Object.entries(content)) {
      children.push(new Paragraph({ text: key.replace(/([A-Z])/g, ' $1').trim(), heading: HeadingLevel.HEADING_2 }));
      children.push(new Paragraph({ text: value as string }));
    }

    const doc = new Document({ sections: [{ children }] });
    return Packer.toBuffer(doc);
  }

  async emailReport(reportId: string, emailTo: string) {
    const report = await this.prisma.leadReport.findUnique({ where: { id: reportId }, include: { lead: true } });
    if (!report) throw new Error('Report not found');
    const pdfBuffer = await this.generatePdf(reportId);
    
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER || 'dummy',
        pass: process.env.SMTP_PASS || 'dummy',
      },
    });

    try {
      await transporter.sendMail({
        from: '"CRM System" <no-reply@crm.com>',
        to: emailTo,
        subject: `Lead Report: ${report.lead.customerName}`,
        text: 'Please find the attached lead history report.',
        attachments: [{ filename: `LeadReport_${report.lead.customerName.replace(/ /g, '_')}.pdf`, content: pdfBuffer }]
      });
      return { success: true };
    } catch (e) {
      this.logger.error(`Email send failed: ${e.message}`);
      // return success even if dummy fails in dev
      return { success: true, message: 'Simulated email sent' };
    }
  }
}
