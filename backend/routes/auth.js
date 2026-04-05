const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const SECRET_KEY = 'ZR_FINANCE_SECRET_KEY';

// Login route
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password required" });

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!user) return res.status(401).json({ error: "Invalid credentials" });

        const validPassword = bcrypt.compareSync(password, user.password_hash);
        if (!validPassword) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '8h' });
        res.json({ token, role: user.role });
    });
});

// Register route (Only ADMIN can create new users)
router.post('/register', authenticateToken, authorizeRoles('ADMIN'), (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) return res.status(400).json({ error: "All fields are required" });

    const validRoles = ['VIEWER', 'ANALYST', 'ADMIN'];
    if (!validRoles.includes(role)) return res.status(400).json({ error: "Invalid role" });

    const password_hash = bcrypt.hashSync(password, 10);

    db.run("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)", [username, password_hash, role], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: "Username already exists" });
            }
            return res.status(500).json({ error: "Database error" });
        }
        res.status(201).json({ message: "User created successfully", id: this.lastID });
    });
});

module.exports = router;
