const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const todoRoutes = require('./routes/ToDoRoute');
const authRoutes = require('./routes/AuthRoute');
const categoryRoutes = require('./routes/CategoryRoute');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// CORS Configuration - Allows frontend to make requests
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // List of allowed origins
        const allowedOrigins = [
            'http://localhost:5000',
            'http://127.0.0.1:5000',
            process.env.FRONTEND_URL, // Your Render frontend URL
            'https://to-do-app-rrmj.onrender.com' // Update with your actual frontend URL
        ].filter(Boolean); // Remove undefined values
        
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
};

// Use CORS - allow all in development, use options in production
if (process.env.NODE_ENV === 'production') {
    app.use(cors(corsOptions));
} else {
    // Development: allow all origins
    app.use(cors({
        origin: true,
        credentials: true
    }));
}

mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB error:', err.message));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/categories', categoryRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve frontend HTML for non-API routes (catch-all must be last)
app.use((req, res) => {
    // Only serve HTML for non-API, non-file requests
    if (!req.path.startsWith('/api') && !req.path.includes('.')) {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
