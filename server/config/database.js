const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create connection pool for MySQL with ACID transaction capability
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'skybook_db',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+05:30',
  decimalNumbers: true, // returns DECIMAL columns as JavaScript numbers
});

// Test connection and log diagnostic status
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Successfully connected to MySQL database: ${process.env.DB_NAME || 'skybook_db'}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('[Database] MySQL Connection Error:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  testConnection
};
