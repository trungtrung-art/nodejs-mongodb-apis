const fs = require('fs')
const path = require('path')

const PDFDocument = require('pdfkit')
const Product = require('../models/product')
    // const Cart = require("../models/cart");
const Order = require('../models/order')

const ITEMS_PER_PAGE = 1

const getProducts = (req, res, next) => {
    const page = +req.query.page || 1
    let totalItems

    Product.find()
        .countDocuments()
        .then((numProduct) => {
            totalItems = numProduct
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        })
        .then((products) => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'Product',
                path: '/products',
                layout: 'main-layout',

                csrfToken: req.csrfToken(),
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
            })
        })
        .catch((err) => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

const getProduct = (req, res, next) => {
    const prodID = req.params.productId
    Product.findById(prodID)
        .then((product) => {
            console.log(product)
            res.render('shop/product-detail', {
                product: product,
                pageTitle: `Product detail ${prodID}`,
                path: '/products',
                layout: 'main-layout',
            })
        })
        .catch((err) => console.error(err))
}

const getIndex = (req, res, next) => {
    const page = +req.query.page || 1
    let totalItems

    Product.find()
        .countDocuments()
        .then((numProduct) => {
            totalItems = numProduct
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        })
        .then((products) => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/',
                layout: 'main-layout',

                csrfToken: req.csrfToken(),
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
            })
        })
        .catch((err) => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

const getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        // .execPopulate()
        .then((user) => {
            const products = user.cart.items
            res.render('shop/cart', {
                pageTitle: 'Cart',
                path: '/cart',
                layout: 'main-layout',
                products: products,
            })
        })
        .catch((err) => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

const postCart = (req, res, next) => {
    const prodID = req.body.productId
    Product.findById(prodID)
        .then((product) => {
            return req.user.addToCart(product)
        })
        .then((result) => {
            console.log('Result is ', result)
            res.redirect('/cart')
        })
}

const getOrders = (req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
        .then((orders) => {
            res.render('shop/orders', {
                pageTitle: 'Order',
                path: '/orders',
                layout: 'main-layout',
                orders: orders,
            })
        })
        .catch((err) => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

// const getCheckout = (req, res, next) => {
//   Product.fetchAll((products) => {
//     res.render("shop/checkout", {
//       pageTitle: "Checkout",
//       path: "/checkout",
//       layout: "main-layout",
//     });
//   });
// };

const postDeleteCart = (req, res, next) => {
    const prodId = req.body.productId
    req.user
        .deleteItemFormCart(prodId)
        .then((result) => {
            res.redirect('/cart')
        })
        .catch((err) => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

const postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then((user) => {
            console.log('User after populate:', user.cart.items) // Kiểm tra dữ liệu user sau khi populate
            const products = user.cart.items.map((i) => {
                return { quantity: i.quantity, product: {...i.productId._doc } }
            })
            console.log(products)
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user,
                },
                products: products,
            })
            return order.save()
        })
        .then((result) => {
            return req.user.clearCart()
        })
        .then((result) => {
            res.redirect('/orders')
        })
        .catch((err) => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

const getInvoice = (req, res, next) => {
    const orderId = req.params.orderId
    Order.findById(orderId)
        .then((order) => {
            if (!order) {
                return next(new Error('No order found.'))
            }
            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error('Unanthorized'))
            }
            const invoiceName = 'invoice-' + orderId + '.pdf'
            const invoicePath = path.join('data', 'invoices', invoiceName)

            const pdfDoc = new PDFDocument()
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader(
                'Content-Disposition',
                'inline; filename="' + invoiceName + '"',
            )
            pdfDoc.pipe(fs.createWriteStream(invoicePath))
            pdfDoc.pipe(res)

            pdfDoc.fontSize(26).text('Invoice', {
                underline: true,
            })
            pdfDoc.text('-----------------------')
            let totalPrice = 0
            order.products.forEach((prod) => {
                totalPrice += prod.quantity * prod.product.price
                pdfDoc
                    .fontSize(14)
                    .text(
                        prod.product.title +
                        ' - ' +
                        prod.quantity +
                        ' x ' +
                        '$' +
                        prod.product.price,
                    )
            })
            pdfDoc.text('---')
            pdfDoc.fontSize(20).text('Total Price: $' + totalPrice)

            pdfDoc.end()
                // fs.readFile(invoicePath, (err, data) => {
                // 	if (err) {
                // 		return next(err)
                // 	}
                // 	res.setHeader('Content-Type', 'application/pdf')
                // 	res.setHeader(
                // 		'Content-Disposition',
                // 		'attachment; filename="' + invoiceName + '"',
                // 	)
                // 	res.send(data)
                // })
                // const file = fs.createReadStream(invoicePath)

            // file.pipe(res)
        })
        .catch((err) => {
            next(err)
        })
}

module.exports = {
    getProducts,
    getProduct,
    getIndex,
    getCart,
    postCart,
    getOrders,
    // getCheckout,
    postDeleteCart,
    postOrder,
    getInvoice,
}