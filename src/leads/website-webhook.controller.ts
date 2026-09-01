import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('website-integrations')
@Controller('v1/integrations/website')
export class WebsiteWebhookController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post('enquiry')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Public webhook for website enquiry form submissions' })
  async handleWebsiteEnquiry(@Body() body: any) {
    // We pass undefined for the uploadedById since this is an automated system creation
    const lead = await this.leadsService.createLead({
      customerName: body.name || 'Website Visitor',
      phoneNumber: body.phoneNumber,
      email: body.email,
      serviceInterest: body.serviceInterest,
      notes: body.notes,
      source: 'Website',
    }, undefined);

    return { success: true, leadId: lead.id };
  }
}
