// Import Mongoose
const mongoose = require('mongoose');
const { indianTime } = require('../services/indianTimer');

// Define the category schema
const productSchema = new mongoose.Schema({
    images: [],
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    mrp: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ["Men", "Women", "Unisex"],
        default: "Unisex"
    },
    size: {
        type: String,
        enum: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL"],
        default: "M"
    },
    brand: {
        type: String
    },
    price: {
        type: String
    },
    stock: {
        type: Number
    },
    sku: {
        type: String
    },
    tags: [],
    shortDescription: {
        type: String
    },
    description: {
        type: String,
        required: true
    },
    createdAt: {
        type: String,
        default: indianTime
    },
    last_updated: {
        type: String,
        default: indianTime
    }
});

// Create the Category model
const ProductModel = mongoose.model('product', productSchema);

// Export the Category model
module.exports = { ProductModel };
