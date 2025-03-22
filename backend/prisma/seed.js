const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@telemedix.com' },
      update: {},
      create: {
        email: 'admin@telemedix.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });
    console.log('Admin user created:', admin.email);

    // Create doctor user
    const doctorPassword = await bcrypt.hash('doctor123', 10);
    const doctor = await prisma.user.upsert({
      where: { email: 'doctor@telemedix.com' },
      update: {},
      create: {
        email: 'doctor@telemedix.com',
        password: doctorPassword,
        firstName: 'Doctor',
        lastName: 'User',
        role: 'DOCTOR',
        status: 'ACTIVE',
      },
    });
    console.log('Doctor user created:', doctor.email);

    // Create medic user
    const medicPassword = await bcrypt.hash('medic123', 10);
    const medic = await prisma.user.upsert({
      where: { email: 'medic@telemedix.com' },
      update: {},
      create: {
        email: 'medic@telemedix.com',
        password: medicPassword,
        firstName: 'Medic',
        lastName: 'User',
        role: 'MEDIC',
        status: 'ACTIVE',
      },
    });
    console.log('Medic user created:', medic.email);

    // Delete all existing data except users
    console.log('Cleaning up existing data...');
    await prisma.note.deleteMany({});
    await prisma.vitalSign.deleteMany({});
    await prisma.treatmentStep.deleteMany({});
    await prisma.treatmentPlan.deleteMany({});
    await prisma.medicalRecord.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.attachment.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.auditLog.deleteMany({});
    console.log('Database cleaned up - all test/mock data removed');

    console.log('Seeding completed - only the three test user accounts remain.');
  } catch (error) {
    console.error('Error seeding database:', error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();