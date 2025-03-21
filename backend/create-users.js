const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createUsers() {
  try {
    // Versuche, vorhandene Benutzer zu löschen
    try {
      await prisma.user.deleteMany({});
      console.log('Vorhandene Benutzer gelöscht');
    } catch (error) {
      console.log('Keine vorhandenen Benutzer zu löschen oder Tabelle existiert nicht');
    }
    
    // Admin-Benutzer erstellen
    await prisma.user.create({
      data: {
        email: 'admin@telemedix.com',
        password: bcrypt.hashSync('admin123', 10),
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN'
      }
    });
    
    // Arzt-Benutzer erstellen
    await prisma.user.create({
      data: {
        email: 'doctor@telemedix.com',
        password: bcrypt.hashSync('doctor123', 10),
        firstName: 'Doctor',
        lastName: 'User',
        role: 'DOCTOR'
      }
    });
    
    // Medic-Benutzer erstellen
    await prisma.user.create({
      data: {
        email: 'medic@telemedix.com',
        password: bcrypt.hashSync('medic123', 10),
        firstName: 'Medic',
        lastName: 'User',
        role: 'MEDIC'
      }
    });
    
    console.log('Benutzer erfolgreich erstellt!');
  } catch (error) {
    console.error('Fehler beim Erstellen der Benutzer:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUsers(); 