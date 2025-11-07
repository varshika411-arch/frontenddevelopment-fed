const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get all achievements for a user
router.get('/', authMiddleware, (req, res) => {
    db.all(
        `SELECT * FROM achievements WHERE user_id = ? ORDER BY created_at DESC`,
        [req.user.id],
        (err, achievements) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching achievements'
                });
            }
            res.json({
                success: true,
                achievements
            });
        }
    );
});

// Create new achievement
router.post('/', authMiddleware, (req, res) => {
    const { title, description, category } = req.body;

    db.run(
        `INSERT INTO achievements (user_id, title, description, category) VALUES (?, ?, ?, ?)`,
        [req.user.id, title, description, category],
        function(err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error creating achievement'
                });
            }

            res.json({
                success: true,
                achievement: {
                    id: this.lastID,
                    user_id: req.user.id,
                    title,
                    description,
                    category,
                    status: 'pending'
                }
            });
        }
    );
});

// Update achievement
router.put('/:id', authMiddleware, (req, res) => {
    const { title, description, category } = req.body;

    db.run(
        `UPDATE achievements SET title = ?, description = ?, category = ? 
         WHERE id = ? AND user_id = ?`,
        [title, description, category, req.params.id, req.user.id],
        function(err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error updating achievement'
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Achievement not found or unauthorized'
                });
            }

            res.json({
                success: true,
                message: 'Achievement updated successfully'
            });
        }
    );
});

// Delete achievement
router.delete('/:id', authMiddleware, (req, res) => {
    db.run(
        'DELETE FROM achievements WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id],
        function(err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error deleting achievement'
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Achievement not found or unauthorized'
                });
            }

            res.json({
                success: true,
                message: 'Achievement deleted successfully'
            });
        }
    );
});

// Verify achievement (admin only)
router.post('/:id/verify', [authMiddleware, adminMiddleware], (req, res) => {
    db.run(
        `UPDATE achievements SET status = 'verified', verified_by = ? WHERE id = ?`,
        [req.user.id, req.params.id],
        function(err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error verifying achievement'
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Achievement not found'
                });
            }

            // Create notification for user
            db.get('SELECT user_id FROM achievements WHERE id = ?', [req.params.id], (err, achievement) => {
                if (!err && achievement) {
                    db.run(
                        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
                        [
                            achievement.user_id,
                            'Achievement Verified',
                            'Your achievement has been verified by an administrator'
                        ]
                    );
                }
            });

            res.json({
                success: true,
                message: 'Achievement verified successfully'
            });
        }
    );
});

module.exports = router;