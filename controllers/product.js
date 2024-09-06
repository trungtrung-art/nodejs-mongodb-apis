const mongodb = require('mongodb')
// CONTROLLER OF PRODUCT
const Product = require('../models/product')

const getAddProductPage = (req, res, next) => {
	res.render('admin/edit-product', {
		pageTitle: 'Add product',
		path: '/admin/add-product',
		editing: false,
		formCSS: true,
		productCSS: true,
		activeProduct: true,
		activeShop: false,
		layout: 'main-layout',
	})
}

const postAddProduct = (req, res, next) => {
	// Lấy dữ liệu từ request body
	const dataFromBody = req.body

	// Chuyển đổi đối tượng thành chuỗi JSON và parse lại thành đối tượng
	const parsedData = JSON.parse(JSON.stringify(dataFromBody))

	const { title, imageUrl, des, price } = parsedData
	const product = new Product(title, imageUrl, price, des, null, req.user._id)
	product
		.save()
		.then((result) => {
			res.redirect('/')
		})
		.catch((err) => console.error(err))
}

const postEditProduct = (req, res, next) => {
	const updatedTitle = req.body.title
	const updatedImageUrl = req.body.imageUrl
	const updatedPrice = req.body.price
	const updatedDes = req.body.des
	const prodId = req.body.productId

	const product = new Product(
		updatedTitle,
		updatedImageUrl,
		updatedDes,
		updatedPrice,
		new mongodb.ObjectId(prodId),
	)
	product
		.save()
		.then((result) => {
			res.redirect('/admin/products')
		})
		.catch((err) => {
			console.error(err)
		})
}

const getEditProductPage = (req, res, next) => {
	const editMode = req.query.edit
	if (!editMode) {
		res.redirect('/')
	}
	const prodId = req.params.productId
	Product.findById(prodId)
		.then((product) => {
			if (!product) {
				res.redirect('/')
			}
			res.render('admin/edit-product', {
				pageTitle: 'Edit product',
				path: '/admin/edit-product',
				editing: editMode,
				formCSS: true,
				productCSS: true,
				activeProduct: true,
				activeShop: false,
				layout: 'main-layout',
				product: product,
			})
		})
		.catch((err) => {
			console.error(err)
		})
}

const getProducts = (req, res, next) => {
	Product.fetchAll()
		.then((products) => {
			res.render('admin/products', {
				prods: products,
				pageTitle: 'Admin Product',
				path: '/admin/products',
				layout: 'main-layout',
			})
		})
		.catch((err) => {
			console.error(err)
		})
}

const postDeleteProduct = (req, res, next) => {
	const prodId = req.body.productId
	Product.deleteById(prodId)
		.then((result) => {
			res.redirect('/admin/products')
		})
		.catch((err) => {
			console.error(err)
		})
}

module.exports = {
	getAddProductPage,
	postAddProduct,
	getProducts,
	getEditProductPage,
	postEditProduct,
	postDeleteProduct,
}
