const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Seeding database with initial data...');

  try {
    // Create or update users
    console.log('Creating/updating users...');
    
    // 1. Admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@telemedix.com' },
      update: {
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        status: 'ACTIVE'
      },
      create: {
        email: 'admin@telemedix.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });
    console.log(`Admin user: ${admin.id}`);
    
    // 2. Doctor user
    const doctorPassword = await bcrypt.hash('password123', 10);
    const doctor = await prisma.user.upsert({
      where: { email: 'doctor@telemedix.com' },
      update: {
        password: doctorPassword,
        firstName: 'Test',
        lastName: 'Doctor',
        role: 'DOCTOR',
        status: 'ACTIVE'
      },
      create: {
        email: 'doctor@telemedix.com',
        password: doctorPassword,
        firstName: 'Test',
        lastName: 'Doctor',
        role: 'DOCTOR',
        status: 'ACTIVE'
      }
    });
    console.log(`Doctor user: ${doctor.id}`);
    
    // 3. Medic user
    const medicPassword = await bcrypt.hash('medic123', 10);
    const medic = await prisma.user.upsert({
      where: { email: 'medic.wagner@telemedix.com' },
      update: {
        password: medicPassword,
        firstName: 'Medic',
        lastName: 'Wagner',
        role: 'MEDIC',
        status: 'ACTIVE'
      },
      create: {
        email: 'medic.wagner@telemedix.com',
        password: medicPassword,
        firstName: 'Medic',
        lastName: 'Wagner',
        role: 'MEDIC',
        status: 'ACTIVE'
      }
    });
    console.log(`Medic user: ${medic.id}`);
    
    // Clean up existing sessions
    console.log('\nCleaning up existing sessions...');
    await prisma.note.deleteMany({});
    await prisma.vitalSign.deleteMany({});
    await prisma.treatmentStep.deleteMany({});
    await prisma.treatmentPlan.deleteMany({});
    await prisma.medicalRecord.deleteMany({});
    await prisma.attachment.deleteMany({});
    await prisma.session.deleteMany({});
    
    // Create sessions
    console.log('\nCreating sessions...');
    
    // Create 2 active sessions
    const activeSession1 = await prisma.session.create({
      data: {
        title: 'Akute Bauchschmerzen',
        patientCode: 'PAT-001',
        status: 'ACTIVE',
        priority: 'HIGH',
        createdById: medic.id,
        assignedToId: doctor.id
      }
    });
    console.log(`Active session created: ${activeSession1.id}`);
    
    await prisma.medicalRecord.create({
      data: {
        sessionId: activeSession1.id,
        patientHistory: 'Patient klagt über starke Bauchschmerzen und Übelkeit seit gestern Abend',
        currentMedications: 'Keine',
        allergies: 'Penicillin'
      }
    });
    
    const activeSession2 = await prisma.session.create({
      data: {
        title: 'Kopfschmerzen und Schwindel',
        patientCode: 'PAT-002',
        status: 'ACTIVE',
        priority: 'MEDIUM',
        createdById: medic.id,
        assignedToId: doctor.id
      }
    });
    console.log(`Active session created: ${activeSession2.id}`);
    
    // Create 5 pending sessions
    for (let i = 1; i <= 5; i++) {
      const pendingSession = await prisma.session.create({
        data: {
          title: `Wartende Anfrage ${i}`,
          patientCode: `PAT-${i+10}`,
          status: 'PENDING',
          priority: i % 2 === 0 ? 'HIGH' : 'NORMAL',
          createdById: medic.id
        }
      });
      
      await prisma.medicalRecord.create({
        data: {
          sessionId: pendingSession.id,
          patientHistory: `Patientenhistorie für Anfrage ${i}`,
          currentMedications: 'Keine',
          allergies: 'Keine bekannt'
        }
      });
      
      await prisma.note.create({
        data: {
          sessionId: pendingSession.id,
          content: `Dies ist eine wartende Anfrage Nr. ${i} die noch nicht zugewiesen wurde.`
        }
      });
      
      console.log(`Pending session created: ${pendingSession.id}`);
    }
    
    console.log('\nDatabase seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 