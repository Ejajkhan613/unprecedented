// Import Mongoose
const mongoose = require('mongoose');


// Custom Modules
const { indianTime } = require("../services/indianTimer");


// Define the user schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    mobile: {
        type: String
    },
    mobileVerified: {
        type: Boolean,
        default: false,
    },
    password: {
        type: String
    },
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer"
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    date_of_birth: {
        type: String
    },
    addresses: [
        {
            name: String,
            mobile: String,
            pincode: String,
            city: String,
            state: String,
            country: String,
            street: String,
            locality: String,
            landmark: {
                type: String,
                default: ""
            },
            addressType: {
                type: String,
                enum: ["Home", "Office", "Other"],
                default: "Home"
            },
            createdAt: {
                type: String,
                default: indianTime
            },
            last_updated: {
                type: String,
                default: indianTime
            }
        },
    ],
    wishlist: [],
    cart: [],
    status: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: String,
        default: indianTime
    },
    last_updated: {
        type: String,
        default: indianTime
    },
    last_sign_in_at: {
        type: String,
        default: indianTime
    }
});

// Create the User model
const userModel = mongoose.model('user', userSchema);

// Export the User model
module.exports = { userModel };

