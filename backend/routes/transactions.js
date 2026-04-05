const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// All transaction routes require authentication
router.use(authenticateToken);

// GET all transactions (Viewer, Analyst, Admin) with Filtering
router.get('/', (req, res) => {
    let query = "SELECT * FROM transactions";
    const params = [];
    const conditions = [];

    if (req.query.type) {
        conditions.push("type = ?");
        params.push(req.query.type);
    }
    if (req.query.category) {
        conditions.push("category = ?");
        params.push(req.query.category);
    }
    if (req.query.date) {
        conditions.push("date = ?");
        params.push(req.query.date);
    }

    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }
    
    query += " ORDER BY id DESC";

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(rows);
    });
});

// POST new transaction (Analyst, Admin only)
router.post('/', authorizeRoles('ANALYST', 'ADMIN'), (req, res) => {
    const { amount, type, category, date, description } = req.body;
    
    if (!amount || !type || !category || !date) {
        return res.status(400).json({ error: "Amount, type, category, and date are required" });
    }
    if (type !== 'INCOME' && type !== 'EXPENSE') {
        return res.status(400).json({ error: "Type must be INCOME or EXPENSE" });
    }

    const created_by = req.user.id;

    db.run(
        "INSERT INTO transactions (amount, type, category, date, description, created_by) VALUES (?, ?, ?, ?, ?, ?)",
        [amount, type, category, date, description, created_by],
        function(err) {
            if (err) return res.status(500).json({ error: "Database error" });
            res.status(201).json({ message: "Transaction created", id: this.lastID });
        }
    );
});

// PUT update transaction (Admin only)
router.put('/:id', authorizeRoles('ADMIN'), (req, res) => {
    const { id } = req.params;
    const { amount, type, category, date, description } = req.body;

    // simplistic update
    db.run(
        "UPDATE transactions SET amount = coalesce(?, amount), type = coalesce(?, type), category = coalesce(?, category), date = coalesce(?, date), description = coalesce(?, description) WHERE id = ?",
        [amount, type, category, date, description, id],
        function(err) {
            if (err) return res.status(500).json({ error: "Database error" });
            if (this.changes === 0) return res.status(404).json({ error: "Transaction not found" });
            res.json({ message: "Transaction updated" });
        }
    );
});

// DELETE transaction (Admin only)
router.delete('/:id', authorizeRoles('ADMIN'), (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM transactions WHERE id = ?", [id], function(err) {
        if (err) return res.status(500).json({ error: "Database error" });
        if (this.changes === 0) return res.status(404).json({ error: "Transaction not found" });
        res.json({ message: "Transaction deleted" });
    });
});

module.exports = router;
