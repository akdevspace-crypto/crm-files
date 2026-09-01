const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Checking for existing LEAD_CREATED rule...');
  
  const existing = await prisma.workflowAutomation.findFirst({
    where: { triggerType: 'LEAD_CREATED', actionType: 'TRIGGER_OUTBOUND_CALL' }
  });

  if (existing) {
    console.log('Rule already exists:', existing.id);
  } else {
    const rule = await prisma.workflowAutomation.create({
      data: {
        name: 'Auto-Call Website Enquiries',
        description: 'Automatically triggers an AI Voicebot outbound call when a new lead is created via the website.',
        triggerType: 'LEAD_CREATED',
        actionType: 'TRIGGER_OUTBOUND_CALL',
        isActive: true,
      }
    });
    console.log('Created rule:', rule.id);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
