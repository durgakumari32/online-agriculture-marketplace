// db.js - MySQL Database Connection
const mysql = require('mysql2');

// Create a connection pool for better performance
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'kumari',       // <-- Set your MySQL password here
    database: process.env.DB_NAME || 'agriculture_marketplace',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        return;
    }
    console.log('✅ MySQL Database connected successfully!');
    connection.release();
});

// Export promise-based pool
module.exports = pool.promise();
