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
app.use(cors());

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
