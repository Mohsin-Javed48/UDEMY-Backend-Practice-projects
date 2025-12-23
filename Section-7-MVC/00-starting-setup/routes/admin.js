const path = require("path");
const productController = require("../controllers/product");
const postAddProduct = require("../controllers/product");
const express = require("express");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", productController.getAddProduct);

// /admin/add-product => POST
router.post("/add-product", productController.postAddProduct);

module.exports = router;
