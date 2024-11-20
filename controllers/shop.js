const Product = require('../models/product')
// const Cart = require("../models/cart");
// const Order = require("../models/order");

const getProducts = (req, res, next) => {
	Product.find()
		.then((products) => {
			console.log(products)
			res.render('shop/product-list', {
				prods: products,
				pageTitle: 'Product',
				path: '/products',
				layout: 'main-layout',
			})
		})
		.catch((err) => console.error(err))
}

const getProduct = (req, res, next) => {
	const prodID = req.params.productId
	console.log(prodID)
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
	Product.find()
		.then((products) => {
			res.render('shop/index', {
				prods: products,
				pageTitle: 'Shop',
				path: '/',
				layout: 'main-layout',
			})
		})
		.catch((err) => console.error(err))
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
			console.error(err)
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
	req.user
		.getOrders()
		.then((orders) => {
			console.log(orders)
			res.render('shop/orders', {
				pageTitle: 'Order',
				path: '/orders',
				layout: 'main-layout',
				orders: orders,
			})
		})
		.catch((err) => {
			console.error(err)
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
			console.log('DELETE CART SUCCESSFULL')
			res.redirect('/cart')
		})
		.catch((err) => {
			console.error(err)
		})
}

const postOrder = (req, res, next) => {
	let fetchedCart
	req.user
		.addOrder()
		.then((result) => {
			res.redirect('/orders')
		})
		.catch((err) => {
			console.error(err)
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
}
