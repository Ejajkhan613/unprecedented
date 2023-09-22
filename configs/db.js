// Dependencies
const mongoose = require("mongoose");
require('dotenv').config();



// Connection with Mongoose
const MongoDB_Connection = mongoose.connect(process.env.MONGODB_URL);



// Exporting Module
module.exports = { MongoDB_Connection };