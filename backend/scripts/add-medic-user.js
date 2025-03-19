const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Füge einen MEDIC Benutzer hinzu...');

  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const medic = await prisma.user.create({
      data: {
        email: 'medic@telemedix.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'Medic',
        role: 'MEDIC',
        status: 'ACTIVE'
      }
    });
    
    console.log('MEDIC Benutzer erstellt:', medic.id);
    console.log('Email:', medic.email);
  } catch (error) {
    console.error('Fehler beim Erstellen des MEDIC Benutzers:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 