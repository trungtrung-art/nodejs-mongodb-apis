const path = require('path')
const express = require('express')
const rootDir = require('../utils/path')
const { check, body } = require('express-validator')
const controllerProduct = require('../controllers/product')
const isAuth = require('../middleware/is-auth')

const route = express.Router()

// admin/add-product GET
route.get('/add-product', isAuth, controllerProduct.getAddProductPage)

// admin/products GET
route.get('/products', isAuth, controllerProduct.getProducts)

// // admin/add-product POST
route.post(
    '/add-product', [
        body('title').isString().isLength({ min: 3 }).trim(),

        body('price').isFloat(),
        body('des').isLength({ min: 5, max: 400 }).trim(),
    ],
    isAuth,
    controllerProduct.postAddProduct,
)

route.get(
    '/edit-product/:productId',
    isAuth,
    controllerProduct.getEditProductPage,
)

route.post(
    '/edit-product', [
        body('title').isString().isLength({ min: 3 }).trim(),
        body('imageUrl').isURL(),
        body('price').isFloat(),
        body('des').isLength({ min: 5, max: 400 }).trim(),
    ],
    isAuth,
    controllerProduct.postEditProduct,
)

route.post('/delete-product', isAuth, controllerProduct.postDeleteProduct)

module.exports = route