const User = require('../models/user')

exports.getLogin = (req, res, next) => {
    // const isLoggedIn = req.get('Cookie').split(';')[0].trim().split('=')[1]
    console.log(req.session.isLoggedIn)
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        layout: 'main-layout',
        isAuthenticated: false,
    })
}

exports.postLogin = (req, res, next) => {
    User.findById('673aae95a7d4df2fe7f4bf00')
        .then((user) => {
            req.session.isLoggedIn = true
            req.session.user = user
            req.session.save((err) => {
                console.log(err)
                res.redirect('/')
            })
        })
        .catch((err) => {
            console.log(err)
        })
}

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err)
        res.redirect('/')
    })
}