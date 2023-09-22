// Dependencies
const express = require("express");
const cors = require("cors");


// Dot env addition
require('dotenv').config();



// Custom Modules
const { MongoDB_Connection } = require("./configs/db");
const { userRoute } = require("./routes/userRoute");
const { productRoute } = require("./routes/productRoute");



// Port
const Port = process.env.PORT;



// Converting express into an app variable
const app = express();



// Using Cors
app.use(cors());


// Homepage Route
app.get("/", (req, res) => {
    res.send("Welcome to Unprecedented");
});


app.use("/user", userRoute);

app.use("/product", productRoute);



// Starting server and connecting to the MongoDB
app.listen(Port, async () => {
    try {
        await MongoDB_Connection;
        console.log("Connected to Database");
    } catch (error) {
        console.log("Error while connecting to Database");
    }
    console.log(`Listening to the port ${Port}`);
});