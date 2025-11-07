const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Ensure the data directory exists in development
if (process.env.NODE_ENV !== 'production') {
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
}

// Always use in-memory database for now to avoid file system issues
const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Database connected successfully to in-memory SQLite');
    }
});

function initializeDatabase() {
    db.serialize(() => {
        // Users table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'student',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Achievements table
        db.run(`
            CREATE TABLE IF NOT EXISTS achievements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                title TEXT NOT NULL,
                description TEXT,
                category TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                verified_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (verified_by) REFERENCES users (id)
            )
        `);

        // Notifications table
        db.run(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                read BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `);

        // Skills table
        db.run(`
            CREATE TABLE IF NOT EXISTS skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                name TEXT NOT NULL,
                level INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `);
        
        // Seed admin user if ADMIN_EMAIL and ADMIN_PASSWORD env vars are provided
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (adminEmail && adminPassword) {
            db.get('SELECT id FROM users WHERE email = ?', [adminEmail], async (err, row) => {
                if (err) {
                    console.error('Error checking admin user existence:', err);
                    return;
                }
                if (!row) {
                    try {
                        const salt = await bcrypt.genSalt(10);
                        const hashed = await bcrypt.hash(adminPassword, salt);
                        db.run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                            ['Administrator', adminEmail, hashed, 'admin'], function(insertErr) {
                                if (insertErr) {
                                    console.error('Error creating admin user:', insertErr);
                                } else {
                                    console.log('Admin user created:', adminEmail);
                                }
                            }
                        );
                    } catch (hashErr) {
                        console.error('Error hashing admin password:', hashErr);
                    }
                } else {
                    console.log('Admin user already exists:', adminEmail);
                }
            });
        }
    });
}

module.exports = {
    db,
    initializeDatabase
};