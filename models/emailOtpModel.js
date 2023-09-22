// Dependencies
const mongoose = require("mongoose");



// Schema
const emailOtpSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: '300s' }
    }
});



// Model
const EmailOtpModel = mongoose.model("emailotp", emailOtpSchema);



// Exporting Modules
module.exports = { EmailOtpModel };