const path = require("path");
const express = require("express");
const rootDir = require("../utils/path");
const controllerProduct = require("../controllers/product");

const route = express.Router();

// admin/add-product GET
route.get("/add-product", controllerProduct.getAddProductPage);

// admin/products GET
route.get("/products", controllerProduct.getProducts);

// admin/add-product POST
route.post("/add-product", controllerProduct.postAddProduct);

route.get("/edit-product/:productId", controllerProduct.getEditProductPage);

route.post("/edit-product", controllerProduct.postEditProduct);

route.post("/delete-product", controllerProduct.postDeleteProduct);

module.exports = route;
