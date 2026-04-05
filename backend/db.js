const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Create tables
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT CHECK(role IN ('VIEWER', 'ANALYST', 'ADMIN')) NOT NULL DEFAULT 'VIEWER'
            )`, (err) => {
                if (!err) {
                    // Create default admin if not exists
                    const defaultAdminUser = 'admin';
                    const defaultAdminPass = bcrypt.hashSync('admin123', 10);
                    db.get("SELECT id FROM users WHERE username = ?", [defaultAdminUser], (err, row) => {
                        if (!row) {
                            db.run("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)", 
                                [defaultAdminUser, defaultAdminPass, 'ADMIN']);
                            console.log("Default Admin created: admin / admin123");
                        }
                    });
                }
            });

            db.run(`CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                amount REAL NOT NULL,
                type TEXT CHECK(type IN ('INCOME', 'EXPENSE')) NOT NULL,
                category TEXT NOT NULL,
                date TEXT NOT NULL,
                description TEXT,
                created_by INTEGER,
                FOREIGN KEY (created_by) REFERENCES users (id)
            )`);
        });
    }
});

module.exports = db;
