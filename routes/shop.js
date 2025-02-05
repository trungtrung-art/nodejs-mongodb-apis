const path = require('path')
const express = require('express')
const controllerShop = require('../controllers/shop')
const isAuth = require('../middleware/is-auth')

const route = express.Router()

route.get('/', controllerShop.getIndex)

route.get('/products', controllerShop.getProducts)
route.get('/products/:productId', controllerShop.getProduct)
route.get('/cart', isAuth, controllerShop.getCart)
route.post('/cart', isAuth, controllerShop.postCart)
route.get('/orders', isAuth, controllerShop.getOrders)
route.get('/checkout', isAuth, controllerShop.getCheckout)
route.post('/delete-cart-item', isAuth, controllerShop.postDeleteCart)
route.post('/create-order', isAuth, controllerShop.postOrder)

route.get('/orders/:orderId', isAuth, controllerShop.getInvoice)

module.exports = route