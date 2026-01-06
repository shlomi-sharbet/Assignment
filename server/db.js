const mysql = require('mysql2/promise');
const logger = require('./logger');

const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 4000,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'test',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;

async function connectDB() {
    let retries = 20; // Increased retries
    while (retries > 0) {
        try {
            // Step 1: Connect without DB to create it
            const tempConfig = { ...dbConfig, database: undefined };
            const tempConnection = await mysql.createConnection(tempConfig);
            await tempConnection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'test'}`);
            await tempConnection.end();
            logger.info(`Database ${process.env.DB_NAME || 'test'} checked/created`);

            // Step 2: Connect with DB
            pool = mysql.createPool(dbConfig);
            const connection = await pool.getConnection();
            logger.info('Successfully connected to TiDB database');

            // Initialize tables
            await connection.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    token VARCHAR(512)
                )
            `);
            logger.info('Users table checked/created');

            // Initialize Default User ("Create a default user with password")
            const [users] = await connection.query('SELECT * FROM users WHERE username = ?', ['admin']);
            if (users.length === 0) {
                await connection.query('INSERT INTO users (username, password) VALUES (?, ?)', ['admin', 'admin123']);
                logger.info('Default admin user created (admin/admin123)');
            }

            connection.release();
            return;
        } catch (error) {
            logger.error(`Error connecting to database. Retries left: ${retries}`, error.message);
            retries -= 1;
            await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds
        }
    }
    logger.error('Failed to connect to database after multiple attempts');
    process.exit(1);
}

function getPool() {
    return pool;
}

module.exports = { connectDB, getPool };
