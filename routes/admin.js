const path = require('path')
const express = require('express')
const rootDir = require('../utils/path')
const controllerProduct = require('../controllers/product')
const isAuth = require('../middleware/is-auth')

const route = express.Router()

// admin/add-product GET
route.get('/add-product', isAuth, controllerProduct.getAddProductPage)

// admin/products GET
route.get('/products', isAuth, controllerProduct.getProducts)

// // admin/add-product POST
route.post('/add-product', isAuth, controllerProduct.postAddProduct)

route.get(
    '/edit-product/:productId',
    isAuth,
    controllerProduct.getEditProductPage,
)

route.post('/edit-product', isAuth, controllerProduct.postEditProduct)

route.post('/delete-product', isAuth, controllerProduct.postDeleteProduct)

module.exports = route