const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Dashboard routes require authentication and Analyst/Admin role
router.use(authenticateToken);
router.use(authorizeRoles('ANALYST', 'ADMIN'));

// GET overall summary snapshot
router.get('/summary', (req, res) => {
    db.all("SELECT type, SUM(amount) as total FROM transactions GROUP BY type", [], (err, rows) => {
        if (err) return res.status(500).json({ error: "Database error" });
        
        let totalIncome = 0;
        let totalExpense = 0;
        
        rows.forEach(row => {
            if (row.type === 'INCOME') totalIncome = row.total;
            if (row.type === 'EXPENSE') totalExpense = row.total;
        });

        res.json({
            totalIncome,
            totalExpense,
            netBalance: totalIncome - totalExpense
        });
    });
});

// GET totals grouped by category (e.g., 'Eiffel Keychain', 'Rent')
router.get('/category-totals', (req, res) => {
    const query = `
        SELECT category, type, SUM(amount) as total 
        FROM transactions 
        GROUP BY category, type
        ORDER BY total DESC
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(rows);
    });
});

module.exports = router;
