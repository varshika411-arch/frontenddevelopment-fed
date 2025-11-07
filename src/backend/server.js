const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const { initializeDatabase } = require('./config/database');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize database
try {
    initializeDatabase();
    console.log('Database initialized successfully');
} catch (error) {
    console.error('Database initialization error:', error);
    // Continue running the server even if database initialization fails
}

// Handle production
if (process.env.NODE_ENV === 'production') {
    // Handle SPA routing
    app.get('*', (req, res) => {
        if (req.url.startsWith('/api')) {
            return res.status(404).json({ message: 'API endpoint not found' });
        }
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    });
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/admin', require('./routes/admin'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});