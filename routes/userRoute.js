// Inbuilt Modules
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const xss = require("xss");

// Custom Modules
const { tokenVerify } = require("../middlewares/token");
const { UserModel } = require("../models/userModel");
const { email_OTP_sending } = require("../mailing/emailOtp");
const { EmailOtpModel } = require("../models/emailOtpModel");
const { indianTime } = require("../services/indianTimer");
const { isValidName } = require("../services/nameValidation");


// Routing
const userRoute = express.Router();

// Salt
const saltRounds = 12;


// Secret Key
const secretKey = process.env.SECRET_KEY;


// JSON Parser
userRoute.use(express.json());



// OTP Sending
userRoute.get("/sendEmailOTP/:email", async (req, res) => {
    try {
        let email = xss(req.params.email);

        const emailExist = await UserModel.findOne({ "email": email });

        if (emailExist) {
            return res.status(400).send({ "error": "Email Already Registered" });
        }

        const emailStatus = await email_OTP_sending(email);

        if (!emailStatus.status) {
            return res.status(400).send({ "error": "Failed to send OTP" });
        }

        const hashedOTP = bcrypt.hashSync(emailStatus.otp, saltRounds);

        const filter = { "email": email };
        const update = { "otp": hashedOTP, "createdAt": Date.now() };

        const result = await EmailOtpModel.findOneAndUpdate(filter, update, {
            upsert: true,
            new: true
        });

        if (result) {
            return res.status(200).send({ "msg": "OTP Sent Successfully" });
        } else {
            return res.status(500).send({ "error": "Failed to update new OTP" });
        }
    } catch (error) {
        res.status(500).send({ "error": "Internal Server Error" });
    }
});



// Verify Email OTP and Save email, password
userRoute.post("/verifyEmailOTP", async (req, res) => {
    try {
        let { email, otp, password } = req.body;

        email = xss(email);
        otp = xss(otp);

        if (!email) {
            return res.status(400).send({ "msg": "Email Not Provided" });
        }

        if (!otp) {
            return res.status(400).send({ "msg": "OTP Not Provided" });
        }

        if (!password) {
            return res.status(400).send({ "msg": "Password Not Provided" });
        }


        let findInDB = await EmailOtpModel.findOne({ "email": email });

        if (!findInDB) {
            return res.status(400).send({ "msg": "Invalid OTP" });
        }

        let isOtpMatching = bcrypt.compareSync(otp, findInDB.otp);

        if (isOtpMatching) {
            let hashedPassword = bcrypt.hashSync(password, saltRounds);

            let newUser = new UserModel({ email, "emailVerified": true, "mobile": "", "password": hashedPassword });
            await newUser.save();

            await EmailOtpModel.findByIdAndDelete({ "_id": findInDB._id });

            let token = jwt.sign({ "userID": newUser._id }, secretKey, { expiresIn: '30d' });

            res.status(201).send({ "msg": "Verification Successfull", "Access_Token": token, "id": newUser._id, "email": newUser.email });
        } else {
            res.status(400).send({ "msg": "Invalid OTP" });
        }
    } catch (error) {
        res.status(500).send({ "msg": "Server error while verification" });
    }
});



// Fill User Details Form
userRoute.patch("/update", tokenVerify, async (req, res) => {
    try {
        let user = req.userDetail;

        let { name, mobile, gender, date_of_birth } = req.body;

        if (name) {
            name = xss(name);
            if (!isValidName(name)) {
                return res.status(400).send({ "msg": "Name is Wrong" });
            } else {
                user.name = name;
            }
        }

        if (mobile) {
            user.mobile = xss(mobile);
        }

        if (gender) {
            user.gender = xss(gender);
        }

        if (date_of_birth) {
            user.date_of_birth = xss(date_of_birth);
        }

        user.last_updated = indianTime();

        await user.save();

        res.status(200).send({ "msg": "Profile Updated" });
    } catch (error) {
        res.status(500).send({ "msg": "Server error while updating profile" });
    }
});




// User Login Route
userRoute.post("/login", async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email) {
            return res.status(400).send({ "msg": "Email Not Provided" });
        }
        email = xss(email);

        if (!password) {
            return res.status(400).send({ "msg": "Password Not Provided" });
        }


        // Matching input from Database
        let user = await UserModel.findOne({ email });

        if (user) {
            const isPasswordValid = bcrypt.compareSync(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).send({ "msg": "Not Found: Wrong Credentials" });
            }

            user.last_sign_in_at = indianTime();
            await user.save();

            let token = jwt.sign({ "userID": user._id }, secretKey, { expiresIn: '30d' });

            res.status(201).send({ "msg": "Verification Successfull", "Access_Token": token, "id": user._id, "email": user.email });

        } else {
            res.status(400).send({ "msg": "Not Found: Wrong Credentials" });
        }
    } catch (error) {
        res.status(500).send({ "msg": "Server error while login" });
    }
});




// ------------------------- Address --------------------------------

// Get One Address
userRoute.get("/address/:id", tokenVerify, async (req, res) => {
    try {
        let user = req.userDetail;

        let addressID = xss(req.params.id);

        let isValidID = true;
        let index;
        for (let a = 0; a < user.addresses.length; a++) {
            if (user.addresses[a]._id == addressID) {
                index = a;
                isValidID = false;
                break;
            }
        }
        if (isValidID) {
            res.status(400).send({ "msg": "Address Not Found" });
        } else {
            res.status(200).send(user.addresses[index]);
        }
    } catch (error) {
        res.status(500).send({ "msg": "Server error while getting address" });
    }
});


// Get Address List
userRoute.get("/address", tokenVerify, async (req, res) => {
    try {

        let address = req.userDetail.addresses;
        if (address.length) {
            res.status(200).send(address);
        } else {
            res.status(404).send({ "msg": "Address is Empty" });
        }
    } catch (error) {
        res.status(500).send({ "msg": "Server error while getting address list" });
    }
});


// Add Address
userRoute.post("/address", tokenVerify, async (req, res) => {
    try {
        let { name, mobile, pincode, city, state, country, street, locality, landmark, addressType } = req.body;

        let user = req.userDetail;

        if (user.addresses.length >= 5) {
            return res.status(400).send({ "msg": "You can save upto 5 address only" });
        }

        let newAddress = {};

        if (!name) {
            return res.status(400).send({ "msg": "Name is Missing" });
        }

        if (!isValidName(name)) {
            return res.status(400).send({ "msg": "Name is Wrong" });
        }
        newAddress.name = xss(name);

        if (!mobile) {
            return res.status(400).send({ "msg": "Mobile Number is Missing" });
        }
        newAddress.mobile = xss(mobile);

        if (!pincode) {
            return res.status(400).send({ "msg": "Pincode is Missing" });
        }
        newAddress.pincode = xss(pincode);

        if (!city) {
            return res.status(400).send({ "msg": "City is Missing" });
        }
        newAddress.city = xss(city);

        if (!state) {
            return res.status(400).send({ "msg": "State is Missing" });
        }
        newAddress.state = xss(state);

        if (!country) {
            return res.status(400).send({ "msg": "Country is Missing" });
        }
        newAddress.country = xss(country);

        if (!street) {
            return res.status(400).send({ "msg": "Street is Missing" });
        }
        newAddress.street = xss(street);

        if (!locality) {
            return res.status(400).send({ "msg": "Locality is Missing" });
        }
        newAddress.locality = xss(locality);

        if (landmark) {
            newAddress.landmark = xss(landmark);
        }

        if (addressType) {
            newAddress.addressType = xss(addressType);
        }

        user.addresses.push(newAddress);
        await user.save();

        res.status(201).send({ "msg": "New Address Added" });
    } catch (error) {
        res.status(500).send({ "msg": "Server error while adding new address" });
    }
})


// Update Address
userRoute.patch("/address/:id", tokenVerify, async (req, res) => {
    try {
        let { name, mobile, pincode, city, state, country, street, locality, landmark, addressType } = req.body;

        let user = req.userDetail;

        let addressID = xss(req.params.id);

        let isValidID = true;
        let index;
        for (let a = 0; a < user.addresses.length; a++) {
            if (user.addresses[a]._id == addressID) {
                index = a;
                isValidID = false;
                break;
            }
        }


        if (isValidID) {
            return res.status(400).send({ "msg": "Address does not exist" });
        }

        let updateAddress = {};

        if (!name) {
            return res.status(400).send({ "msg": "Name is Missing" });
        }
        if (!isValidName(name)) {
            return res.status(400).send({ "msg": "Name is Wrong" });
        }
        updateAddress.name = xss(name);

        if (!mobile) {
            return res.status(400).send({ "msg": "Mobile Number is Missing" });
        }
        updateAddress.mobile = xss(mobile);

        if (!pincode) {
            return res.status(400).send({ "msg": "Pincode is Missing" });
        }
        updateAddress.pincode = xss(pincode);

        if (!city) {
            return res.status(400).send({ "msg": "City is Missing" });
        }
        updateAddress.city = xss(city);

        if (!state) {
            return res.status(400).send({ "msg": "State is Missing" });
        }
        updateAddress.state = xss(state);

        if (!country) {
            return res.status(400).send({ "msg": "Country is Missing" });
        }
        updateAddress.country = xss(country);

        if (!street) {
            return res.status(400).send({ "msg": "Street is Missing" });
        }
        updateAddress.street = xss(street);

        if (!locality) {
            return res.status(400).send({ "msg": "Locality is Missing" });
        }
        updateAddress.locality = xss(locality);

        if (landmark) {
            updateAddress.landmark = xss(landmark);
        }

        if (addressType) {
            updateAddress.addressType = xss(addressType);
        }

        updateAddress.last_updated = indianTime();
        updateAddress.createdAt = user.addresses[index].createdAt;
        updateAddress._id = user.addresses[index]._id;


        user.addresses[index] = updateAddress;
        await user.save();

        res.status(201).send({ "msg": "Address Updated" });
    } catch (error) {
        res.status(500).send({ "msg": "Server error while adding new address" });
    }
});


// Delete Address
userRoute.delete("/address/:id", tokenVerify, async (req, res) => {
    try {
        let user = req.userDetail;
        let addressID = xss(req.params.id);
        let isValidID = false;


        for (let a = 0; a < user.addresses.length; a++) {
            if (user.addresses[a]._id == addressID) {
                isValidID = true;
                // Removing the address from the array
                user.addresses.splice(a, 1);
                break;
            }
        }

        if (isValidID) {
            await user.save();
            res.status(200).send({ "msg": "Address deleted successfully" });
        } else {
            res.status(404).send({ "msg": "Address not found" });
        }
    } catch (error) {
        res.status(500).send({ "msg": "Server error while deleting address" });
    }
});


// ------------------------- Address --------------------------------



// ------------------------- Wishlist --------------------------------



// User Wishlist
userRoute.get("/wishlist", tokenVerify, async (req, res) => {
    try {

        const wishlist = req.userDetail.wishlist;
        if (wishlist.length) {
            res.status(200).send(wishlist);
        } else {
            res.status(404).send({ "msg": "Wishlist is Empty" });
        }
    } catch (error) {
        res.status(500).send({ "msg": "Server error while getting Wishlist" });
    }
});



// Add into Wishlist
userRoute.post("/wishlist/:id", tokenVerify, async (req, res) => {
    try {
        let id = xss(req.params.id);
        let product = await ProductModel.findById(id);
        if (!product) {
            return res.status(400).send({ "msg": "Product Not Found, Can't add to Wishlist" });
        }

        let user = req.userDetail;

        if (user.wishlist.includes(id)) {
            return res.status(400).send({ "msg": "Already in Wishlist" });
        }

        user.wishlist.push(id);
        await user.save();

        res.status(200).send({ "msg": "Added to Wishlist" });
    } catch (error) {
        res.status(500).send({ "msg": "Server error while adding in Wishlist" });
    }
});


// Delete from Wishlist
userRoute.delete("/wishlist/:id", tokenVerify, async (req, res) => {
    try {
        let id = xss(req.params.id);
        let user = req.userDetail;

        if (!user.wishlist.includes(id)) {
            return res.status(400).send({ "msg": "Not Found in Wishlist, Can't Delete" });
        }

        let index = user.wishlist.indexOf(id)

        user.wishlist.splice(index, 1);
        await user.save();

        res.status(200).send({ "msg": "Deleted" });
    } catch (error) {
        res.status(500).send({ "msg": "Server error while adding in Wishlist" });
    }
});


// ------------------------- Wishlist --------------------------------



// ------------------------- CART --------------------------------


// User Cart
userRoute.get("/cart", tokenVerify, async (req, res) => {
    try {
        const cart = req.userDetail.cart;
        if (cart.length) {
            let productList = await ProductModel.find({ _id: { $in: cart.map(item => item.id) } });

            res.status(200).send(productList);
        } else {
            res.status(404).send({ "msg": "Cart is Empty" });
        }
    } catch (error) {
        res.status(500).send({ "msg": "Server error while getting Cart" });
    }
});




// Add into Cart
userRoute.post("/cart/", tokenVerify, async (req, res) => {
    try {
        let { id, quantity } = req.body;

        if (!id) {
            return res.status(400).send({ "msg": "Product ID is Missing" });
        }
        id = xss(id);

        if (!quantity) {
            return res.status(400).send({ "msg": "Product Quantity is Missing" });
        }
        quantity = parseInt(xss(quantity));


        let product = await ProductModel.findById(id);
        if (!product) {
            return res.status(400).send({ "msg": "Product Not Found, Can't add to Cart" });
        }

        let user = req.userDetail;

        let isAlreadyExist = false;
        for (let a = 0; a < user.cart.length; a++) {
            if (user.cart[a].id == id) {
                isAlreadyExist = true;
                break;
            }
        }

        if (isAlreadyExist) {
            return res.status(400).send({ "msg": "Already in Cart" });
        }

        user.cart.push({ id, quantity });
        await user.save();

        res.status(200).send({ "msg": "Added to Cart" });
    } catch (error) {
        res.status(500).send({ "msg": "Server error while adding in Cart" });
    }
});


// Delete from Cart
userRoute.delete("/cart/:id", tokenVerify, async (req, res) => {
    try {
        let id = xss(req.params.id);
        let user = req.userDetail;

        let isAlreadyExist = false;
        let index;
        for (let a = 0; a < user.cart.length; a++) {
            if (user.cart[a].id == id) {
                isAlreadyExist = true;
                index = a;
                break;
            }
        }

        if (!isAlreadyExist) {
            return res.status(400).send({ "msg": "Not Found in Cart, Can't Delete" });
        }

        user.cart.splice(index, 1);
        await user.save();

        res.status(200).send({ "msg": "Removed from Cart" }, user.cart);
    } catch (error) {
        res.status(500).send({ "msg": "Server error while adding in Cart" });
    }
});


// ------------------------- CART --------------------------------


// ------------------------- CHECKOUT --------------------------------



// ------------------------- CHECKOUT --------------------------------





module.exports = { userRoute };