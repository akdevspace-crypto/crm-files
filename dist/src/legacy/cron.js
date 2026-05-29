"use strict";
const cron = require('node-cron');
const prisma = require('./prisma');
function initCronJobs(io) {
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            const fifteenMinsFromNow = new Date(now.getTime() + 15 * 60000);
            const fourteenMinsFromNow = new Date(now.getTime() + 14 * 60000);
            const upcomingFollowups = await prisma.leadFollowup.findMany({
                where: {
                    status: 'PENDING',
                    followupDate: {
                        gte: fourteenMinsFromNow,
                        lte: fifteenMinsFromNow,
                    }
                },
                include: {
                    lead: true,
                    assignedAgent: true
                }
            });
            for (const followup of upcomingFollowups) {
                if (io && followup.assignedAgentId) {
                    io.emit('agentNotification', {
                        targetAgentId: followup.assignedAgentId,
                        type: 'MEETING_REMINDER',
                        title: 'Upcoming Follow-up Appointment',
                        message: `You have a follow-up with ${followup.lead?.customerName || 'Customer'} in 15 minutes.`,
                        leadId: followup.leadId
                    });
                }
                if (followup.lead?.email) {
                    console.log(`[CRON] Sending Email Reminder to ${followup.lead.email} for Appointment at ${followup.followupDate}`);
                }
                console.log(`[CRON] Reminded agent ${followup.assignedAgentId} about followup ${followup.id}`);
            }
        }
        catch (err) {
            console.error('[CRON] Error running appointment reminder job:', err);
        }
    });
    console.log('✅ Cron Jobs Initialized (Appointment Reminders)');
}
module.exports = { initCronJobs };
//# sourceMappingURL=cron.js.map