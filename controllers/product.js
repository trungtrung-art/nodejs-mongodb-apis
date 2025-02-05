const mongodb = require('mongodb')
    // CONTROLLER OF PRODUCT
const Product = require('../models/product')
const { validationResult } = require('express-validator')
const { deleteFile } = require('../utils/file')

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
        hasError: false,
        errorMessage: null,
        validationErrors: [],
    })
}

const postAddProduct = (req, res, next) => {
    // Lấy dữ liệu từ request body
    const dataFromBody = req.body
    const imageUrlFile = req.file
    console.log('imageUrl is ', imageUrlFile)
    if (!imageUrlFile) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add product',
            path: '/admin/add-product',
            editing: false,
            formCSS: true,
            productCSS: true,
            activeProduct: true,
            activeShop: false,
            hasError: true,
            layout: 'main-layout',
            product: {
                ...parsedData,
                imageUrl: null,
            },
            isAuthenticated: req.session.isLoggedIn,
            errorMessage: 'Attached file is not an image',
            validationErrors: [],
        })
    }
    // Chuyển đổi đối tượng thành chuỗi JSON và parse lại thành đối tượng
    const parsedData = JSON.parse(JSON.stringify(dataFromBody))

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add product',
            path: '/admin/add-product',
            editing: false,
            formCSS: true,
            productCSS: true,
            activeProduct: true,
            activeShop: false,
            hasError: true,
            layout: 'main-layout',
            product: {
                ...parsedData,
                imageUrl: imageUrlFile.path,
            },
            isAuthenticated: req.session.isLoggedIn,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
        })
    }

    const { title, imageUrl, des, price } = parsedData

    const product = new Product({
        title: title,
        price: price,
        description: des,
        imageUrl: imageUrlFile.path,
        userId: req.user._id,
    })
    product
        .save()
        .then((result) => {
            res.redirect('/')
        })
        .catch((err) => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

const postEditProduct = (req, res, next) => {
    const updatedTitle = req.body.title
    const image = req.file
    const updatedPrice = req.body.price
    const updatedDes = req.body.des
    const prodId = req.body.productId

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit product',
            path: '/admin/edit-product',
            editing: true,
            formCSS: true,
            productCSS: true,
            activeProduct: true,
            activeShop: false,
            hasError: true,
            layout: 'main-layout',
            product: {
                title: updatedTitle,

                price: updatedPrice,
                des: updatedDes,
                _id: prodId,
            },
            isAuthenticated: req.session.isLoggedIn,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
        })
    }

    Product.findById(prodId)
        .then((product) => {
            console.log(product.userId)
            console.log(req.user._id)
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/')
            }
            product.title = updatedTitle

            product.description = updatedDes
            product.price = updatedPrice
            product._id = prodId
            if (image) {
                deleteFile(product.imageUrl)
                product.imageUrl = image.path
            }
            return product.save().then((result) => {
                console.log('UPDATED PRODUCT')
                res.redirect('/admin/products')
            })
        })
        .catch((err) => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
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
                hasError: false,
                errorMessage: null,
                validationErrors: [],
            })
        })
        .catch((err) => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
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
                validationErrors: [],
            })
        })
        .catch((err) => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
        })
}

const deleteProduct = (req, res, next) => {
    const prodId = req.params.productId

    Product.findById(prodId)
        .then((product) => {
            if (!product) {
                return next(new Error('Product not found.'))
            }
            deleteFile(product.imageUrl)
            return Product.deleteOne({ _id: prodId, userId: req.user._id })
        })
        .then((result) => {
            console.log('REMOVED PRODUCT')
            res.status(200).json({ message: 'Success!' })
        })
        .catch((err) => {
            res.status(500).json({ message: 'Deleting product failed.' })
        })
}

module.exports = {
    getAddProductPage,
    postAddProduct,
    getProducts,
    getEditProductPage,
    postEditProduct,
    deleteProduct,
}