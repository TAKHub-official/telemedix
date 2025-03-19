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
      where: { email: 'dr.mueller@telemedix.com' },
      update: {},
      create: {
        email: 'dr.mueller@telemedix.com',
        password: doctorPassword,
        firstName: 'Dr. Thomas',
        lastName: 'Müller',
        role: 'DOCTOR',
        status: 'ACTIVE',
      },
    });
    console.log('Doctor user created:', doctor.email);

    // Create medic user
    const medicPassword = await bcrypt.hash('medic123', 10);
    const medic = await prisma.user.upsert({
      where: { email: 'medic.wagner@telemedix.com' },
      update: {},
      create: {
        email: 'medic.wagner@telemedix.com',
        password: medicPassword,
        firstName: 'Lukas',
        lastName: 'Wagner',
        role: 'MEDIC',
        status: 'ACTIVE',
      },
    });
    console.log('Medic user created:', medic.email);

    console.log('Seeding completed.');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 