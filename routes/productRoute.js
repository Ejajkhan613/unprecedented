// Modules
const express = require("express");
const xss = require("xss");


// Custom Modules
const { ProductModel } = require("../models/productModel");



// Routing
const productRoute = express.Router();


// JSON Parser
productRoute.use(express.json());


productRoute.get("/:id", async (req, res) => {
    try {
        let id = xss(req.params.id);
        let product = await ProductModel.findById(id);
        if (product) {
            res.status(200).send(product);
        } else {
            res.status(404).send({ "msg": "Product Not Found" });
        }
    } catch (error) {
        res.status(500).send({ "msg": "Internal server error, try again later" });
    }
});





// Total Count in 1 Page
const ITEMS_PER_PAGE = 20;

// Get Products and filter
productRoute.get("/", async (req, res) => {
    const { minPrice, maxPrice, page, gender, size, brand, tag } = req.query;
    const currentPage = parseInt(page) || 1;

    try {
        let filter = {};

        if (gender) {
            filter.gender = Array.isArray(gender) ? { $in: gender } : gender;
        }

        if (size) {
            filter.size = Array.isArray(size) ? { $in: size } : size;
        }

        if (brand) {
            filter.brand = Array.isArray(brand) ? { $in: brand } : brand;
        }

        if (tag) {
            filter.tags = Array.isArray(tag) ? { $in: tag } : tag;
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) {
                filter.price.$gte = parseFloat(minPrice);
            }
            if (maxPrice) {
                filter.price.$lte = parseFloat(maxPrice);
            }
        }

        const totalCount = await ProductModel.countDocuments(filter);
        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

        const skipItems = (currentPage - 1) * ITEMS_PER_PAGE;
        let data = await ProductModel.find(filter)
            .skip(skipItems)
            .limit(ITEMS_PER_PAGE);

        // Adjusting the data if it's the last page and there's not enough data for a full page
        if (data.length === 0 && currentPage > 1) {
            const lastPageSkipItems = (totalPages - 1) * ITEMS_PER_PAGE;
            data = await ProductModel.find(filter)
                .skip(lastPageSkipItems)
                .limit(totalCount % ITEMS_PER_PAGE);
        }

        res.status(200).send({
            data,
            currentPage: data.length === 0 ? totalPages : currentPage,
            totalPages,
            totalCount,
        });
    } catch (error) {
        res.status(500).send({ error: "Internal server error, try again later" });
    }
});




// Exporting Module
module.exports = { productRoute };