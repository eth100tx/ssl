const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  const connection = await mysql.createConnection(
    process.env.DATABASE_URL || process.env.MYSQL_URL
  );

  try {
    const sql = fs.readFileSync(
      path.join(__dirname, 'init.sql'),
      'utf8'
    );

    console.log('Executing SQL:', sql);
    await connection.query(sql);
    console.log('✅ Database table created successfully!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initDatabase();
