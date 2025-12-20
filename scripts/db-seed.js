#!/usr/bin/env node

/**
 * Database Seed Script (Node.js version for Windows compatibility)
 * Applies development seed data to the database
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
};

console.log(`${colors.green}🌱 Seeding database with development data...${colors.reset}\n`);

try {
  // Check if Supabase is running
  console.log('Checking Supabase status...');
  try {
    execSync('npx supabase status', { stdio: 'pipe' });
  } catch (error) {
    console.log(`${colors.yellow}⚠️  Supabase is not running. Starting...${colors.reset}`);
    execSync('npx supabase start', { stdio: 'inherit' });
    console.log('');
  }

  // Get database URL
  const statusOutput = execSync('npx supabase status', { encoding: 'utf-8' });
  const dbUrlMatch = statusOutput.match(/DB URL:\s+(.+)/);

  if (!dbUrlMatch) {
    throw new Error('Could not get database URL');
  }

  const dbUrl = dbUrlMatch[1].trim();
  console.log(`${colors.green}Database URL found${colors.reset}`);

  // Check if seed file exists
  const seedFilePath = path.join(process.cwd(), 'supabase', 'seed', 'dev_seed.sql');
  if (!fs.existsSync(seedFilePath)) {
    throw new Error(`Seed file not found: ${seedFilePath}`);
  }

  // Apply seed file using psql
  console.log(`${colors.green}Applying seed file...${colors.reset}`);

  const psqlCommand = process.platform === 'win32'
    ? `psql "${dbUrl}" -f "${seedFilePath}"`
    : `psql '${dbUrl}' -f '${seedFilePath}'`;

  execSync(psqlCommand, { stdio: 'inherit' });

  console.log('');
  console.log(`${colors.green}✅ Database seeded successfully!${colors.reset}`);
  console.log('');
  console.log(`${colors.yellow}📝 Important:${colors.reset}`);
  console.log('   1. Create a test user in Supabase Studio (http://localhost:54323)');
  console.log('   2. Email: demo@consultor.ai');
  console.log('   3. Password: Demo@123456');
  console.log('   4. Update supabase/seed/dev_seed.sql with the user_id');
  console.log('   5. Re-run this script');

} catch (error) {
  console.error(`${colors.red}❌ Error seeding database:${colors.reset}`);
  console.error(error.message);

  if (error.message.includes('psql')) {
    console.log('');
    console.log(`${colors.yellow}💡 Tip: Make sure PostgreSQL client (psql) is installed${colors.reset}`);
    console.log('   Download from: https://www.postgresql.org/download/windows/');
  }

  process.exit(1);
}
