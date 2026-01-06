require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getPool } = require('./db');
const logger = require('./logger');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url} - IP: ${req.ip}`);
    next();
});

// Database connection initialized at startup

// Routes

/**
 * Register a new user (Helper for testing)
 */
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    try {
        const pool = getPool();
        const [result] = await pool.execute(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, password]
        );
        logger.info(`User registered: ${username}, ID: ${result.insertId}`);
        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

/**
 * Login
 * "User tokens stored in database"
 * "Tokens sent as HTTP headers"
 */
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = getPool();
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE username = ? AND password = ?',
            [username, password]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = rows[0];

        // Generate Token
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

        // Store token in database
        await pool.execute(
            'UPDATE users SET token = ? WHERE id = ?',
            [token, user.id]
        );

        // Implementation of: "Every time a user logs in, write a log entry in JSON format to console"
        // Format: timestamp, user ID, action, IP address
        const logEntry = {
            timestamp: new Date().toISOString(),
            userId: user.id,
            action: 'LOGIN',
            ip: req.ip
        };
        logger.info(JSON.stringify(logEntry));

        // Return token in header as requested + body
        res.header('x-auth-token', token).json({ message: 'Login successful', token });

    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Init Database and then Start Server
connectDB().then(() => {
    app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
    });
});
