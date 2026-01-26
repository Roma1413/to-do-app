const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const routes = require('./routes/ToDoRoute');

require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

app.use('/api/todos', routes);

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve frontend for all non-API routes (catch-all, must be last)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});