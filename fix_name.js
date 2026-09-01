const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to Supabase production database to update Super Admin name...');
  
  const updatedAgents = await prisma.agent.updateMany({
    where: { 
      name: 'Paramantra Super Admin'
    },
    data: { 
      name: 'Raghav'
    }
  });
  
  console.log(`Updated ${updatedAgents.count} agent records directly in the live database.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
