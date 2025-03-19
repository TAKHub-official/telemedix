const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Adding a new DOCTOR user...');

  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const doctor = await prisma.user.create({
      data: {
        email: 'doctor@telemedix.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'Doctor',
        role: 'DOCTOR',
        status: 'ACTIVE'
      }
    });
    
    console.log('DOCTOR user created:', doctor.id);
    console.log('Email:', doctor.email);
    console.log('Password: password123');
    
    // Assign a pending session to this doctor
    const pendingSession = await prisma.session.findFirst({
      where: { status: 'PENDING' }
    });
    
    if (pendingSession) {
      await prisma.session.update({
        where: { id: pendingSession.id },
        data: {
          assignedToId: doctor.id
        }
      });
      
      console.log(`Assigned session ${pendingSession.id} to doctor`);
    } else {
      console.log('No pending session found to assign');
    }
    
  } catch (error) {
    console.error('Error creating DOCTOR user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 