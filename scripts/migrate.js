const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connection = await mysql.createConnection(
    process.env.DATABASE_URL || process.env.MYSQL_URL
  );

  try {
    const sql = fs.readFileSync(
      path.join(__dirname, 'ssl-schema.sql'),
      'utf8'
    );

    // Split by semicolon and filter empty statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`[${i + 1}/${statements.length}] Executing: ${stmt.substring(0, 50)}...`);
      await connection.query(stmt);
    }

    console.log('\n✅ Database migration completed successfully!');

    // Verify tables were created
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\nCreated tables:');
    tables.forEach(t => console.log(`  - ${Object.values(t)[0]}`));

  } catch (error) {
    console.error('❌ Error running migration:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
