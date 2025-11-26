/**
 * SSL Inc. Database Setup Script
 *
 * Runs schema.sql to create all tables from scratch.
 * WARNING: This will DROP all existing tables!
 *
 * Usage:
 *   DATABASE_URL="mysql://user:pass@host:port/db" node scripts/setup-db.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is required');
  console.error('Usage: DATABASE_URL="mysql://user:pass@host:port/db" node scripts/setup-db.js');
  process.exit(1);
}

async function setup() {
  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    console.log('🗄️  Setting up SSL Inc. database...\n');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolon and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Executing ${statements.length} SQL statements...\n`);

    for (const statement of statements) {
      if (statement.toLowerCase().startsWith('drop')) {
        const tableName = statement.match(/drop table if exists (\w+)/i)?.[1] || 'table';
        process.stdout.write(`   Dropping ${tableName}... `);
      } else if (statement.toLowerCase().startsWith('create table')) {
        const tableName = statement.match(/create table (\w+)/i)?.[1] || 'table';
        process.stdout.write(`   Creating ${tableName}... `);
      } else if (statement.toLowerCase().startsWith('create index')) {
        const indexName = statement.match(/create index (\w+)/i)?.[1] || 'index';
        process.stdout.write(`   Creating index ${indexName}... `);
      } else {
        process.stdout.write(`   Executing statement... `);
      }

      try {
        await connection.execute(statement);
        console.log('✓');
      } catch (err) {
        console.log('✗');
        console.error(`     Error: ${err.message}`);
      }
    }

    console.log('\n========================================');
    console.log('✅ Database schema created successfully!');
    console.log('========================================');
    console.log('\nNext step: Run seed.js to populate with sample data');
    console.log('  node scripts/seed.js\n');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

setup();
