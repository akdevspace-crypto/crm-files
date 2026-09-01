import { Controller, Get, Post, Put, Param, Body, Req, Res, UseGuards, Query } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto, LeadStatusUpdateDto, CreateLeadNoteDto } from './dto/lead.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../auth/rbac.guard';
import { RequirePermissions } from '../auth/permissions.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { AiReportService } from './ai-report.service';

@ApiTags('leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('leads')
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly aiReportService: AiReportService,
  ) {}

  @Get()
  @RequirePermissions('Lead.Read')
  @ApiOperation({ summary: 'Retrieve all leads with dynamic PII masking' })
  async getLeads(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('agentId') agentId?: string,
  ) {
    const userRole = req.user.role;
    const reqAgentId = req.user.id; // Map active session ID
    return this.leadsService.getLeads(status, agentId, userRole, reqAgentId);
  }

  @Post()
  @RequirePermissions('Lead.Create')
  @ApiOperation({ summary: 'Log a new manual lead record' })
  async createLead(@Req() req: any, @Body() dto: CreateLeadDto) {
    return this.leadsService.createLead(dto, req.user.id);
  }

  @Post(':id/claim')
  @RequirePermissions('Lead.Claim')
  @ApiOperation({ summary: 'Acquire lock and claim lead from unassigned pool' })
  async claimLead(@Req() req: any, @Param('id') id: string) {
    return this.leadsService.claimLead(id, req.user.id);
  }

  @Put(':id/status')
  @RequirePermissions('Lead.Update')
  @ApiOperation({ summary: 'Transition lead pipeline status' })
  async updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: LeadStatusUpdateDto,
  ) {
    return this.leadsService.updateLeadStatus(id, req.user.id, dto);
  }

  @Get(':id/notes')
  @RequirePermissions('Lead.Read')
  @ApiOperation({ summary: 'Get audit notes for a lead' })
  async getLeadNotes(@Param('id') id: string) {
    return this.leadsService.getLeadNotes(id);
  }

  @Post(':id/notes')
  @RequirePermissions('Lead.Update')
  @ApiOperation({ summary: 'Append a new note to a lead' })
  async appendLeadNote(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CreateLeadNoteDto,
  ) {
    return this.leadsService.appendLeadNote(id, req.user.id, dto);
  }

  @Post(':id/notes/:noteId/correction')
  @RequirePermissions('Lead.Update')
  @ApiOperation({ summary: 'Append a correction to an existing note' })
  async appendCorrectionNote(
    @Req() req: any,
    @Param('id') leadId: string,
    @Param('noteId') noteId: string,
    @Body() dto: { content: string },
  ) {
    return this.leadsService.appendCorrectionNote(leadId, req.user.id, noteId, dto.content);
  }

  @Post(':id/report/generate')
  @RequirePermissions('Lead.Read')
  @ApiOperation({ summary: 'Generate AI Lead History Report' })
  async generateReport(@Req() req: any, @Param('id') id: string) {
    return this.aiReportService.generateReport(id, req.user.id);
  }

  @Get(':id/report')
  @RequirePermissions('Lead.Read')
  @ApiOperation({ summary: 'Get latest Lead History Report' })
  async getLatestReport(@Param('id') id: string) {
    return this.aiReportService.getLatestReport(id);
  }

  @Get('report/:reportId/export/pdf')
  @RequirePermissions('Lead.Read')
  @ApiOperation({ summary: 'Export Report as PDF' })
  async exportReportPdf(@Param('reportId') reportId: string, @Req() req: any, @Res() res: any) {
    const buffer = await this.aiReportService.generatePdf(reportId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=report-${reportId}.pdf`,
    });
    res.send(buffer);
  }

  @Get('report/:reportId/export/word')
  @RequirePermissions('Lead.Read')
  @ApiOperation({ summary: 'Export Report as Word' })
  async exportReportWord(@Param('reportId') reportId: string, @Req() req: any, @Res() res: any) {
    const buffer = await this.aiReportService.generateWord(reportId);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename=report-${reportId}.docx`,
    });
    res.send(buffer);
  }

  @Post('report/:reportId/email')
  @RequirePermissions('Lead.Read')
  @ApiOperation({ summary: 'Email Lead Report' })
  async emailReport(@Param('reportId') reportId: string, @Body('emailTo') emailTo: string) {
    return this.aiReportService.emailReport(reportId, emailTo);
  }
}
