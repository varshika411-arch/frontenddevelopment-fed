const express = require('express');
const router = express.Router();
const { db } = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get all pending achievements (admin only)
router.get('/pending-achievements', [authMiddleware, adminMiddleware], (req, res) => {
    db.all(
        `SELECT a.*, u.name as user_name, u.email as user_email
         FROM achievements a
         JOIN users u ON a.user_id = u.id
         WHERE a.status = 'pending'
         ORDER BY a.created_at DESC`,
        (err, achievements) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching pending achievements'
                });
            }

            res.json({
                success: true,
                achievements
            });
        }
    );
});

// Get all users (admin only)
router.get('/users', [authMiddleware, adminMiddleware], (req, res) => {
    db.all(
        `SELECT id, name, email, role, created_at
         FROM users
         ORDER BY created_at DESC`,
        (err, users) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching users'
                });
            }

            res.json({
                success: true,
                users
            });
        }
    );
});

// Update user role (admin only)
router.put('/users/:id/role', [authMiddleware, adminMiddleware], (req, res) => {
    const { role } = req.body;
    const userId = req.params.id;

    if (!['student', 'admin'].includes(role)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid role'
        });
    }

    db.run(
        'UPDATE users SET role = ? WHERE id = ?',
        [role, userId],
        function(err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error updating user role'
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                message: 'User role updated successfully'
            });
        }
    );
});

// Get system statistics (admin only)
router.get('/stats', [authMiddleware, adminMiddleware], (req, res) => {
    const stats = {};

    db.serialize(() => {
        // Total users
        db.get('SELECT COUNT(*) as count FROM users', (err, result) => {
            if (!err) stats.totalUsers = result.count;
        });

        // Total achievements
        db.get('SELECT COUNT(*) as count FROM achievements', (err, result) => {
            if (!err) stats.totalAchievements = result.count;
        });

        // Pending verifications
        db.get('SELECT COUNT(*) as count FROM achievements WHERE status = "pending"', (err, result) => {
            if (!err) stats.pendingVerifications = result.count;
        });

        // Recent activities
        db.all(
            `SELECT 'achievement' as type, a.title, u.name as user_name, a.created_at
             FROM achievements a
             JOIN users u ON a.user_id = u.id
             ORDER BY a.created_at DESC
             LIMIT 10`,
            (err, activities) => {
                if (!err) stats.recentActivities = activities;

                res.json({
                    success: true,
                    stats
                });
            }
        );
    });
});

module.exports = router;