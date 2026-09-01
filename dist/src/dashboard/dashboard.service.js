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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardAnalytics(type, query) {
        const totalLeads = await this.prisma.lead.count();
        const totalCustomers = await this.prisma.customer.count();
        const totalAgents = await this.prisma.agent.count({ where: { isDeleted: false } });
        const totalAppointments = await this.prisma.appointment.count();
        const dateFilter = {};
        if (query.startDate && query.endDate) {
            dateFilter.createdAt = {
                gte: new Date(query.startDate),
                lte: new Date(query.endDate),
            };
        }
        const convertedLeads = await this.prisma.lead.count({
            where: { status: 'CONVERTED', ...dateFilter },
        });
        const newLeads = await this.prisma.lead.count({
            where: { status: 'NEW', ...dateFilter },
        });
        const openOpportunities = await this.prisma.lead.count({
            where: { status: 'IN_PROGRESS', ...dateFilter },
        });
        switch (type.toLowerCase()) {
            case 'overall':
                return {
                    kpis: [
                        { label: 'Total Customers', value: totalCustomers.toString(), change: '+4.3%', isPositive: true },
                        { label: 'Total Leads', value: totalLeads.toString(), change: '+12.4%', isPositive: true },
                        { label: 'Active Agents', value: totalAgents.toString(), change: '0.0%', isPositive: true },
                        { label: 'Calls Today', value: '420', change: '+12.4%', isPositive: true },
                        { label: 'Open Tickets', value: '18', change: '-4.2%', isPositive: true },
                        { label: 'Omnichannel Conversations', value: '1,420', change: '+18.4%', isPositive: true },
                        { label: 'Active AI Agents', value: '3', change: 'Synced', isPositive: true },
                        { label: 'SLA Compliance', value: '96.2%', change: '+1.5%', isPositive: true },
                    ],
                    charts: {
                        revenueTrend: [
                            { name: 'Jan', value: 45000 },
                            { name: 'Feb', value: 52000 },
                            { name: 'Mar', value: 49000 },
                            { name: 'Apr', value: 63000 },
                            { name: 'May', value: 58000 },
                            { name: 'Jun', value: 85400 },
                        ],
                        departmentPerformance: [
                            { name: 'Raghav', value: 95 },
                            { name: 'Agent Smith', value: 85 },
                            { name: 'Agent 3', value: 72 },
                        ],
                    },
                };
            case 'executive':
                return {
                    kpis: [
                        { label: 'Total Customers', value: totalCustomers.toString(), change: '+4.3%', isPositive: true },
                        { label: 'Active Leads', value: newLeads.toString(), change: '+12.4%', isPositive: true },
                        { label: 'Lead Conversion Rate', value: `${totalLeads ? Math.round((convertedLeads / totalLeads) * 100) : 0}%`, change: '+3.1%', isPositive: true },
                        { label: 'Total Revenue', value: '$840,250', change: '+14.2%', isPositive: true },
                        { label: 'Open Opportunities', value: openOpportunities.toString(), change: '-2.1%', isPositive: false },
                        { label: 'Active Agents', value: totalAgents.toString(), change: '0.0%', isPositive: true },
                        { label: 'Active Conversations', value: '1,420', change: '+18.4%', isPositive: true },
                        { label: 'Open Tickets', value: '18', change: '-4.2%', isPositive: true },
                    ],
                    charts: {
                        revenueTrend: [
                            { name: 'Jan', value: 45000 },
                            { name: 'Feb', value: 52000 },
                            { name: 'Mar', value: 49000 },
                            { name: 'Apr', value: 63000 },
                            { name: 'May', value: 58000 },
                            { name: 'Jun', value: 85400 },
                        ],
                        salesFunnel: [
                            { name: 'New Leads', value: totalLeads },
                            { name: 'Contacted', value: Math.round(totalLeads * 0.75) },
                            { name: 'Qualified', value: Math.round(totalLeads * 0.45) },
                            { name: 'Opportunities', value: openOpportunities },
                            { name: 'Converted', value: convertedLeads },
                        ],
                        departmentPerformance: [
                            { name: 'Sales', value: 240000 },
                            { name: 'Care Support', value: 180000 },
                            { name: 'Telephony', value: 120000 },
                        ],
                    },
                };
            case 'sales_lead':
                return {
                    kpis: [
                        { label: 'New Leads Pool', value: newLeads.toString(), change: '+12.4%', isPositive: true },
                        { label: 'Qualified Opportunities', value: openOpportunities.toString(), change: '+11.2%', isPositive: true },
                        { label: 'Won Deals', value: convertedLeads.toString(), change: '+9.4%', isPositive: true },
                        { label: 'Lost Deals', value: '12', change: '-2.4%', isPositive: true },
                        { label: 'Pipeline Value', value: `$${openOpportunities * 2500}`, change: '+15.6%', isPositive: true },
                        { label: 'Forecast Revenue', value: '$950,000', change: 'On Track', isPositive: true },
                    ],
                    charts: {
                        pipelineTrend: [
                            { name: 'Week 1', value: 15000 },
                            { name: 'Week 2', value: 22000 },
                            { name: 'Week 3', value: 18000 },
                            { name: 'Week 4', value: 28000 },
                        ],
                        sourceShare: [
                            { name: 'Google Search', value: 40 },
                            { name: 'Referrals', value: 25 },
                            { name: 'Facebook Ads', value: 20 },
                            { name: 'Live Chat', value: 15 },
                        ],
                    },
                };
            case 'agent_performance':
                return {
                    kpis: [
                        { label: 'Calls Handled', value: '420', change: '+12.4%', isPositive: true },
                        { label: 'Average Talk Time', value: '2m 45s', change: 'Optimal', isPositive: true },
                        { label: 'Average Handle Time', value: '4m 12s', change: '-24s', isPositive: true },
                        { label: 'Wrap-up Time', value: '48s', change: 'Optimal', isPositive: true },
                        { label: 'Agent Occupancy', value: '84.2%', change: '+1.5%', isPositive: true },
                        { label: 'SLA Compliance', value: '96.2%', change: '+1.5%', isPositive: true },
                    ],
                    charts: {
                        callsPerHour: [
                            { name: '09:00', value: 12 },
                            { name: '10:00', value: 24 },
                            { name: '11:00', value: 32 },
                            { name: '12:00', value: 18 },
                            { name: '13:00', value: 15 },
                        ],
                        departmentPerformance: [
                            { name: 'Raghav', value: 95 },
                            { name: 'Agent Smith', value: 85 },
                            { name: 'Agent 3', value: 72 },
                        ],
                    },
                };
            case 'omnichannel':
                return {
                    kpis: [
                        { label: 'Incoming Conversations', value: '1,420', change: '+18.4%', isPositive: true },
                        { label: 'Outgoing Conversations', value: '980', change: '+12.1%', isPositive: true },
                        { label: 'Average Response Time', value: '1m 15s', change: '-45s', isPositive: true },
                        { label: 'Resolution Time', value: '4m 30s', change: '-1m', isPositive: true },
                    ],
                    charts: {
                        sourceShare: [
                            { name: 'Voice Calls', value: 45 },
                            { name: 'WhatsApp', value: 30 },
                            { name: 'Email', value: 15 },
                            { name: 'Live Chat', value: 10 },
                        ],
                        pipelineTrend: [
                            { name: 'Mon', value: 180 },
                            { name: 'Tue', value: 240 },
                            { name: 'Wed', value: 210 },
                            { name: 'Thu', value: 280 },
                            { name: 'Fri', value: 250 },
                        ],
                    },
                };
            case 'contact_center':
                return {
                    kpis: [
                        { label: 'Live Active Calls', value: '4', change: 'Real-time', isPositive: true },
                        { label: 'Waiting Queue Length', value: '2', change: 'Low Waiting', isPositive: true },
                        { label: 'Available Active Agents', value: totalAgents.toString(), change: 'Stable', isPositive: true },
                        { label: 'Busy (Break) Agents', value: '1', change: 'Stable', isPositive: true },
                        { label: 'Average Waiting Time', value: '18s', change: '-12s', isPositive: true },
                    ],
                    charts: {
                        callsPerHour: [
                            { name: '09:00', value: 8 },
                            { name: '10:00', value: 15 },
                            { name: '11:00', value: 22 },
                            { name: '12:00', value: 14 },
                        ],
                    },
                };
            case 'customer_experience':
                return {
                    kpis: [
                        { label: 'Customer Satisfaction (CSAT)', value: '88.5%', change: '+2.1%', isPositive: true },
                        { label: 'Net Promoter Score (NPS)', value: '72', change: '+4', isPositive: true },
                        { label: 'Customer Retention Rate', value: '94.2%', change: '+0.8%', isPositive: true },
                        { label: 'Churn Risk Rate', value: '5.8%', change: '-0.8%', isPositive: true },
                    ],
                    charts: {
                        sourceShare: [
                            { name: 'Positive Sentiment', value: 65 },
                            { name: 'Neutral Sentiment', value: 25 },
                            { name: 'Negative Sentiment', value: 10 },
                        ],
                    },
                };
            case 'ai_insights':
                return {
                    kpis: [
                        { label: 'AI Summaries Generated', value: '840', change: '100% Automated', isPositive: true },
                        { label: 'AI Sentiment Accuracy', value: '94.2%', change: '+1.5%', isPositive: true },
                        { label: 'AI Lead Scores Calculated', value: totalLeads.toString(), change: 'Syncing', isPositive: true },
                        { label: 'AI Time Saved', value: '142 Hrs', change: 'High ROI', isPositive: true },
                    ],
                    charts: {
                        pipelineTrend: [
                            { name: 'Week 1', value: 120 },
                            { name: 'Week 2', value: 180 },
                            { name: 'Week 3', value: 240 },
                            { name: 'Week 4', value: 300 },
                        ],
                    },
                };
            case 'reports':
                return {
                    reports: [
                        { id: 'lead_report', name: 'Lead Reports', fields: ['Lead ID', 'Name', 'Phone', 'Status', 'Source'] },
                        { id: 'customer_report', name: 'Customer Reports', fields: ['Customer ID', 'Name', 'Phone', 'ActiveSince', 'Org'] },
                        { id: 'call_report', name: 'Call Reports', fields: ['Call ID', 'Caller', 'Recipient', 'Duration', 'Status'] },
                        { id: 'whatsapp_report', name: 'WhatsApp Reports', fields: ['Msg ID', 'Number', 'Status', 'Direction', 'SentAt'] },
                        { id: 'email_report', name: 'Email Reports', fields: ['Email ID', 'Subject', 'Status', 'Recipient'] },
                        { id: 'ticket_report', name: 'Ticket Reports', fields: ['Ticket ID', 'Title', 'Status', 'Priority'] },
                        { id: 'agent_report', name: 'Agent Reports', fields: ['Agent ID', 'Name', 'Status', 'HandledCalls'] },
                        { id: 'campaign_report', name: 'Campaign Reports', fields: ['Campaign Name', 'Spend', 'ROI', 'Conversions'] },
                        { id: 'revenue_report', name: 'Revenue Reports', fields: ['Invoice No', 'Client', 'Gross', 'GST', 'Date'] },
                        { id: 'user_activity_report', name: 'User Activity Reports', fields: ['User', 'Session Start', 'Duration', 'Browser'] },
                        { id: 'geolocation_report', name: 'Geolocation Reports', fields: ['City', 'CustomerCount', 'SalesVolume'] },
                        { id: 'ai_report', name: 'AI Performance Reports', fields: ['Task', 'Accuracy', 'Sentiment', 'TimeSaved'] },
                    ],
                };
            default:
                return { kpis: [], charts: {} };
        }
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map