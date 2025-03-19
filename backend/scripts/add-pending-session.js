// Skript zum Hinzufügen einer weiteren wartenden Session
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Füge eine weitere wartende Session hinzu...');

  try {
    // Suche Benutzer zum Verknüpfen mit den Sessions
    const medic = await prisma.user.findFirst({
      where: { role: 'MEDIC' }
    });
    
    if (!medic) {
      throw new Error('Kein Medic-Benutzer gefunden');
    }
    
    console.log(`Using medic: ${medic.email}`);

    // Erstelle eine weitere wartende Session
    const session = await prisma.session.create({
      data: {
        title: 'Allergische Reaktion',
        patientCode: 'PAT-005',
        status: 'PENDING',
        priority: 'HIGH',
        createdById: medic.id
      }
    });
    
    await prisma.medicalRecord.create({
      data: {
        sessionId: session.id,
        patientHistory: 'Patient zeigt Anzeichen einer allergischen Reaktion nach dem Verzehr neuer Nahrungsmittel',
        currentMedications: 'Antihistaminika',
        allergies: 'Unbekannt - muss untersucht werden'
      }
    });
    
    await prisma.note.create({
      data: {
        sessionId: session.id,
        content: 'Dringender Fall. Patient benötigt schnelle Beurteilung durch einen Allergologen.'
      }
    });
    
    console.log('Neue wartende Session erstellt:', session.id);
    console.log('Session erfolgreich hinzugefügt!');
  } catch (error) {
    console.error('Fehler beim Erstellen der Session:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 