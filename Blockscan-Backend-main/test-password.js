// test-password.js - Test common PostgreSQL passwords
require('dotenv').config();
const { Pool } = require('pg');

const commonPasswords = [
  '1234',
  'postgres',
  'admin',
  'password',
  'root',
  '',
];

console.log('🔐 Testing common PostgreSQL passwords...\n');

async function testPassword(password) {
  const pool = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: password,
    database: 'postgres',
    connectionTimeoutMillis: 2000,
  });

  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    await pool.end();
    return true;
  } catch (err) {
    await pool.end();
    return false;
  }
}

async function findPassword() {
  for (const pwd of commonPasswords) {
    process.stdout.write(`Testing "${pwd || '(empty)'}"... `);
    const success = await testPassword(pwd);
    if (success) {
      console.log('✅ SUCCESS!\n');
      console.log(`Your PostgreSQL password is: "${pwd}"\n`);
      console.log('Update your .env file with:');
      console.log(`PG_PASSWORD=${pwd}\n`);
      return pwd;
    } else {
      console.log('❌');
    }
  }
  
  console.log('\n❌ None of the common passwords worked.\n');
  console.log('Please:');
  console.log('1. Open pgAdmin and check/reset the password');
  console.log('2. Or tell me your PostgreSQL password and I\'ll update .env');
  console.log('3. See reset-password.md for detailed instructions\n');
  return null;
}

findPassword().then(() => process.exit(0));

