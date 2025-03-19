const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking users:');
    const users = await prisma.user.findMany();
    console.log('Users found:', users.length);
    users.forEach(user => {
      console.log(`- ${user.id}: ${user.email} (${user.role})`);
    });
    
    console.log('\nChecking sessions:');
    const sessions = await prisma.session.findMany({
      include: {
        createdBy: true,
        assignedTo: true,
        medicalRecord: true,
      }
    });
    
    console.log('Sessions found:', sessions.length);
    sessions.forEach(session => {
      console.log(`- ${session.id}: ${session.title}`);
      console.log(`  Status: ${session.status}, Priority: ${session.priority}`);
      console.log(`  Created by: ${session.createdBy.email}`);
      console.log(`  Assigned to: ${session.assignedTo?.email || 'Not assigned'}`);
      console.log('  ---');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 