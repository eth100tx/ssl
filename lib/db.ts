import mysql from 'mysql2/promise';

// Create connection pool
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL || process.env.MYSQL_URL,
});

export default pool;
