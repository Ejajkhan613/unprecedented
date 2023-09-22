// Dependencies
const mongoose = require("mongoose");



// Schema
const mobileOtpSchema = mongoose.Schema({
    mobile: {
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
const MobileOtpModel = mongoose.model("mobileotp", mobileOtpSchema);



// Exporting Modules
module.exports = { MobileOtpModel };