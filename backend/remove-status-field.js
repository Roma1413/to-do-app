// Script to remove status field from all todos in the database
const mongoose = require('mongoose');
require('dotenv').config();

const ToDoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], required: true, default: 'Medium' },
    completed: { type: Boolean, default: false },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const ToDoModel = mongoose.model('ToDo', ToDoSchema);

async function removeStatusField() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('✅ Connected to MongoDB');
        
        // Get all todos
        const todos = await ToDoModel.find({});
        console.log(`📋 Found ${todos.length} todos to update`);
        
        let updated = 0;
        for (const todo of todos) {
            // Set completed based on old status if status exists
            if (todo.status) {
                todo.completed = todo.status === 'Completed';
            }
            // Use $unset to remove status field from database
            await ToDoModel.updateOne(
                { _id: todo._id },
                { 
                    $set: { completed: todo.completed },
                    $unset: { status: "" }
                }
            );
            updated++;
        }
        
        const result = { modifiedCount: updated };
        
        console.log(`✅ Updated ${result.modifiedCount} todos`);
        console.log('✅ Removed status field and set completed field based on old status');
        
        // Use native MongoDB collection to remove status field (bypass Mongoose schema)
        const collection = mongoose.connection.db.collection('todos');
        const unsetResult = await collection.updateMany(
            { status: { $exists: true } },
            { $unset: { status: "" } }
        );
        console.log(`✅ Removed status field from ${unsetResult.modifiedCount} todos using native MongoDB`);
        
        // Verify using native collection
        const todosWithStatus = await collection.countDocuments({ status: { $exists: true } });
        const todosWithCompleted = await collection.countDocuments({ completed: { $exists: true } });
        
        console.log(`\n📊 Verification (using native MongoDB):`);
        console.log(`   - Todos with status field: ${todosWithStatus}`);
        console.log(`   - Todos with completed field: ${todosWithCompleted}`);
        
        if (todosWithStatus === 0) {
            console.log('\n✅ Success! All status fields have been removed from the database.');
        } else {
            console.log('\n⚠️  Warning: Some todos still have the status field.');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

removeStatusField();
