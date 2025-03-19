// Skript zum Erstellen von Test-Sessions für Telemedix
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Creating test sessions...');

  try {
    // Suche Benutzer zum Verknüpfen mit den Sessions
    const medic = await prisma.user.findFirst({
      where: { role: 'MEDIC' }
    });
    
    if (!medic) {
      throw new Error('Kein Medic-Benutzer gefunden');
    }
    
    const doctor = await prisma.user.findFirst({
      where: { role: 'DOCTOR' }
    });
    
    if (!doctor) {
      throw new Error('Kein Doctor-Benutzer gefunden');
    }
    
    console.log(`Using medic: ${medic.email} and doctor: ${doctor.email}`);

    // Lösche vorhandene Sessions und zugehörige Daten
    console.log('Bereinige vorhandene Sessions...');
    await prisma.note.deleteMany({});
    await prisma.medicalRecord.deleteMany({});
    await prisma.session.deleteMany({});
    console.log('Bestehende Sessions gelöscht');

    // Erstelle Test-Sessions
    
    // 1. Aktive Session dem Arzt zugewiesen
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
    
    console.log('Aktive Session erstellt:', session1.id);

    // 2. Eine weitere aktive Session
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
    
    console.log('Weitere aktive Session erstellt:', session2.id);

    // 3. Wartende Session
    const session3 = await prisma.session.create({
      data: {
        title: 'Routineuntersuchung',
        patientCode: 'PAT-003',
        status: 'PENDING',
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
    
    console.log('Wartende Session erstellt:', session3.id);

    // 4. Abgeschlossene Session
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
    
    console.log('Abgeschlossene Session erstellt:', session4.id);

    console.log('Alle Test-Sessions wurden erfolgreich erstellt!');
  } catch (error) {
    console.error('Fehler beim Erstellen der Test-Sessions:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 