const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Get user's portfolio
router.get('/:userId', (req, res) => {
    const userId = req.params.userId;

    // Get user details
    db.get('SELECT id, name, email FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching user details'
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get verified achievements
        db.all(
            `SELECT * FROM achievements 
             WHERE user_id = ? AND status = 'verified' 
             ORDER BY created_at DESC`,
            [userId],
            (err, achievements) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Error fetching achievements'
                    });
                }

                // Get skills
                db.all(
                    'SELECT * FROM skills WHERE user_id = ?',
                    [userId],
                    (err, skills) => {
                        if (err) {
                            return res.status(500).json({
                                success: false,
                                message: 'Error fetching skills'
                            });
                        }

                        res.json({
                            success: true,
                            portfolio: {
                                user,
                                achievements,
                                skills
                            }
                        });
                    }
                );
            }
        );
    });
});

// Update skills (authenticated user only)
router.post('/skills', authMiddleware, (req, res) => {
    const { skills } = req.body;

    // Start a transaction
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // Delete existing skills
        db.run('DELETE FROM skills WHERE user_id = ?', [req.user.id], (err) => {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({
                    success: false,
                    message: 'Error updating skills'
                });
            }

            // Insert new skills
            const stmt = db.prepare('INSERT INTO skills (user_id, name, level) VALUES (?, ?, ?)');
            
            try {
                skills.forEach(skill => {
                    stmt.run(req.user.id, skill.name, skill.level);
                });
                stmt.finalize();
                db.run('COMMIT');

                res.json({
                    success: true,
                    message: 'Skills updated successfully'
                });
            } catch (err) {
                db.run('ROLLBACK');
                res.status(500).json({
                    success: false,
                    message: 'Error updating skills'
                });
            }
        });
    });
});

module.exports = router;