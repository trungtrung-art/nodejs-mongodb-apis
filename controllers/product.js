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
        isAuthenticated: req.session.isLoggedIn,
    })
}

const postAddProduct = (req, res, next) => {
    // Lấy dữ liệu từ request body
    const dataFromBody = req.body

    // Chuyển đổi đối tượng thành chuỗi JSON và parse lại thành đối tượng
    const parsedData = JSON.parse(JSON.stringify(dataFromBody))

    const { title, imageUrl, des, price } = parsedData
    const product = new Product({
        title: title,
        price: price,
        description: des,
        imageUrl: imageUrl,
        userId: req.user,
    })
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

    Product.findById(prodId)
        .then((product) => {
            console.log(product.userId)
            console.log(req.user._id)
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/')
            }
            product.title = updatedTitle
            product.imageUrl = updatedImageUrl
            product.description = updatedDes
            product.price = updatedPrice
            product._id = prodId
            return product.save().then((result) => {
                console.log('UPDATED PRODUCT')
                res.redirect('/admin/products')
            })
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
                isAuthenticated: req.session.isLoggedIn,
            })
        })
        .catch((err) => {
            console.error(err)
        })
}

const getProducts = (req, res, next) => {
    Product.find({ userId: req.user._id })
        .then((products) => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Product',
                path: '/admin/products',
                layout: 'main-layout',
                isAuthenticated: req.session.isLoggedIn,
            })
        })
        .catch((err) => {
            console.error(err)
        })
}

const postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId
    Product.deleteOne({ _id: prodId, userId: req.user._id })
        .then((result) => {
            console.log('REMOVED PRODUCT')
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