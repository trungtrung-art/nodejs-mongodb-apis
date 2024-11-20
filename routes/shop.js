const path = require('path')
const express = require('express')
const controllerShop = require('../controllers/shop')

const route = express.Router()

route.get('/', controllerShop.getIndex)

route.get('/products', controllerShop.getProducts)
route.get('/products/:productId', controllerShop.getProduct)
// route.get('/cart', controllerShop.getCart)
route.post('/cart', controllerShop.postCart)
// route.get('/orders', controllerShop.getOrders)
// // route.get("/checkout", controllerShop.getCheckout);
// route.post('/delete-cart-item', controllerShop.postDeleteCart)
// route.post('/create-order', controllerShop.postOrder)

module.exports = route
