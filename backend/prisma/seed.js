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

    // Delete any existing sessions to avoid duplicates
    console.log('Cleaning up existing sessions...');
    await prisma.note.deleteMany({});
    await prisma.medicalRecord.deleteMany({});
    await prisma.session.deleteMany({});
    console.log('Existing sessions cleaned up');

    // Create test sessions
    console.log('Creating test sessions...');
    
    // 1. Active session assigned to the doctor
    const session1 = await prisma.session.create({
      data: {
        title: 'Akute Bauchschmerzen',
        patientCode: 'PAT-001',
        status: 'ACTIVE',
        priority: 'HIGH',
        createdById: medic.id,
        assignedToId: doctor.id
      }
    });
    
    await prisma.medicalRecord.create({
      data: {
        sessionId: session1.id,
        patientHistory: 'Patient berichtet über starke Bauchschmerzen seit gestern.',
        currentMedications: 'Keine',
        allergies: 'Penicillin'
      }
    });
    
    await prisma.note.create({
      data: {
        sessionId: session1.id,
        content: 'Patient benötigt dringende Untersuchung.'
      }
    });
    
    console.log('Active session created:', session1.id);

    // 2. Another active session
    const session2 = await prisma.session.create({
      data: {
        title: 'Kopfschmerzen und Schwindel',
        patientCode: 'PAT-002',
        status: 'ACTIVE',
        priority: 'MEDIUM',
        createdById: medic.id,
        assignedToId: doctor.id
      }
    });
    
    await prisma.medicalRecord.create({
      data: {
        sessionId: session2.id,
        patientHistory: 'Wiederkehrende Kopfschmerzen seit 2 Wochen',
        currentMedications: 'Ibuprofen bei Bedarf',
        allergies: 'Keine bekannt'
      }
    });
    
    console.log('Another active session created:', session2.id);

    // 3. Open session (changed from PENDING to OPEN)
    const session3 = await prisma.session.create({
      data: {
        title: 'Routineuntersuchung',
        patientCode: 'PAT-003',
        status: 'OPEN',
        priority: 'LOW',
        createdById: medic.id
      }
    });
    
    await prisma.medicalRecord.create({
      data: {
        sessionId: session3.id,
        patientHistory: 'Jährliche Routineuntersuchung',
        currentMedications: 'Keine',
        allergies: 'Keine'
      }
    });
    
    console.log('Open session created:', session3.id);

    // 4. Completed session
    const session4 = await prisma.session.create({
      data: {
        title: 'Nachkontrolle nach Grippe',
        patientCode: 'PAT-004',
        status: 'COMPLETED',
        priority: 'NORMAL',
        createdById: medic.id,
        assignedToId: doctor.id,
        completedAt: new Date()
      }
    });
    
    await prisma.medicalRecord.create({
      data: {
        sessionId: session4.id,
        patientHistory: 'Grippe vor 2 Wochen, jetzt vollständig erholt',
        currentMedications: 'Keine mehr',
        allergies: 'Keine'
      }
    });
    
    await prisma.note.create({
      data: {
        sessionId: session4.id,
        content: 'Patient zeigt keine Symptome mehr.'
      }
    });
    
    await prisma.note.create({
      data: {
        sessionId: session4.id,
        content: 'Empfehlung: Normale Aktivitäten wieder aufnehmen.'
      }
    });
    
    console.log('Completed session created:', session4.id);

    console.log('All test sessions created successfully!');
    console.log('Seeding completed.');
  } catch (error) {
    console.error('Error seeding database:', error);
    console.error(error.stack); // Zeigt den vollständigen Stack-Trace
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();