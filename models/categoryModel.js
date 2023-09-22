// Import Mongoose
const mongoose = require('mongoose');

// Define the category schema
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 50,
    },
    description: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// Create the Category model
const CategoryModel = mongoose.model('category', categorySchema);

// Export the Category model
module.exports = { CategoryModel };
