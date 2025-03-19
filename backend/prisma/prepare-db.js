// Script to prepare the database with migrations and seed data
const { execSync } = require('child_process');
const path = require('path');

/**
 * Run database migrations and seed data
 */
async function prepareDatabase() {
  console.log('Preparing database...');
  
  try {
    // Generate Prisma client
    console.log('Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Run migrations
    console.log('Running database migrations...');
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
    
    // Seed database
    console.log('Seeding database...');
    execSync('node prisma/seed.js', { stdio: 'inherit' });
    
    console.log('Database prepared successfully!');
  } catch (error) {
    console.error('Error preparing database:', error);
    process.exit(1);
  }
}

// Run the function
prepareDatabase(); 