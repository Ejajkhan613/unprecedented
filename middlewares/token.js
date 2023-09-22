// Dependencies
const jwt = require("jsonwebtoken");
const xss = require("xss");

// Custom Modules
const { UserModel } = require("../models/userModel");

// Secret Key
const secretKey = process.env.SECRET_KEY;


// Verification
const tokenVerify = async (req, res, next) => {
    const token = xss(req.headers.authorization);
    let id = xss(req.headers.id);
    try {
        if (token && id) {
            jwt.verify(token, secretKey, async (err, decoded) => {
                if (err) {
                    res.status(401).send({ "msg": "Unauthorized: Please Login to access this resource" });
                    return;
                }

                let userDetail = await UserModel.findById(decoded.userID);

                if (userDetail && userDetail._id == id && userDetail.status) {
                    req.userDetail = userDetail;
                    next();
                } else {
                    res.status(401).send({ "msg": "Unauthorized: User not found, login again" });
                }
            });
        } else {
            res.status(401).send({ "msg": "Unauthorized: Please Login to access this resource" });
        }
    } catch (error) {
        res.status(500).send({ "msg": "Internal Server Error: Something Went Wrong While Authorization" });
    }
};



// Exporting Module
module.exports = { tokenVerify };