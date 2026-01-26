const ToDoModel = require('../models/ToDoModel');

// GET all todos
module.exports.getToDo = async (req, res) => {
    try {
        const todos = await ToDoModel.find().sort({ createdAt: -1 });
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET single todo by ID
module.exports.getToDoById = async (req, res) => {
    try {
        const todo = await ToDoModel.findById(req.params.id);
        if (!todo) return res.status(404).json({ error: 'ToDo not found' });
        res.json(todo);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        res.status(500).json({ error: error.message });
    }
};

// POST create new todo
module.exports.saveToDo = async (req, res) => {
    try {
        const todo = await ToDoModel.create(req.body);
        res.status(201).json(todo);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

// PUT update todo
module.exports.updateToDo = async (req, res) => {
    try {
        const todo = await ToDoModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!todo) return res.status(404).json({ error: 'ToDo not found' });
        res.json(todo);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

// DELETE todo
module.exports.deleteToDo = async (req, res) => {
    try {
        const todo = await ToDoModel.findByIdAndDelete(req.params.id);
        if (!todo) return res.status(404).json({ error: 'ToDo not found' });
        res.json({ message: 'ToDo deleted successfully' });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        res.status(500).json({ error: error.message });
    }
};