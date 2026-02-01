// Script to fix category indexes - run this once to remove old global unique index
const mongoose = require('mongoose');
require('dotenv').config();

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    color: { type: String, default: '#667eea' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const CategoryModel = mongoose.model('Category', CategorySchema);

async function fixIndexes() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('✅ Connected to MongoDB');
        
        // Get all indexes
        const indexes = await CategoryModel.collection.getIndexes();
        console.log('Current indexes:', indexes);
        
        // Drop any old global unique index on 'name' if it exists
        try {
            await CategoryModel.collection.dropIndex('name_1');
            console.log('✅ Dropped old global unique index on name');
        } catch (err) {
            if (err.code === 27) {
                console.log('ℹ️  No old global index on name to drop');
            } else {
                throw err;
            }
        }
        
        // Drop compound unique index if it exists (allow duplicate names)
        try {
            await CategoryModel.collection.dropIndex('user_1_name_1');
            console.log('✅ Dropped compound unique index on (user, name)');
        } catch (err) {
            if (err.code === 27) {
                console.log('ℹ️  No compound unique index to drop');
            } else {
                throw err;
            }
        }
        
        // Create non-unique index for faster queries (not unique - allows duplicates)
        await CategoryModel.collection.createIndex({ user: 1, name: 1 });
        console.log('✅ Created non-unique index on (user, name) for faster queries');
        
        // Show final indexes
        const finalIndexes = await CategoryModel.collection.getIndexes();
        console.log('Final indexes:', finalIndexes);
        
        console.log('\n✅ Index fix complete! Each user can now have their own categories with the same name.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixIndexes();
