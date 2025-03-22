// Script to prepare the PostgreSQL database with migrations and seed data
const { execSync } = require('child_process');

/**
 * Run database migrations and seed data for PostgreSQL
 */
async function prepareDatabase() {
  console.log('Preparing PostgreSQL database...');
  
  try {
    // Generate Prisma client
    console.log('Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Run migrations
    console.log('Running PostgreSQL migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    // Seed database with only test users
    console.log('Seeding database with test users only...');
    execSync('node prisma/seed.js', { stdio: 'inherit' });
    
    console.log('PostgreSQL database prepared successfully!');
  } catch (error) {
    console.error('Error preparing database:', error);
    process.exit(1);
  }
}

// Run the function
prepareDatabase(); 