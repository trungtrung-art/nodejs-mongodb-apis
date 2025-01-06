const bcryptjs = require('bcryptjs')
const User = require('../models/user')
const bcrypt = require('bcryptjs/dist/bcrypt')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')

const transporter = nodemailer.createTransport(
    sendgridTransport({
        auth: {},
    }),
)

exports.getLogin = (req, res, next) => {
    let message = req.flash('error')
    if (message.length === 0) {
        message = null
    }
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        layout: 'main-layout',
        errorMessage: message,
    })
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    User.findOne({ email: email })
        .then((user) => {
            if (!user) {
                req.flash('error', 'Invalid email or password.')
                return res.redirect('/login')
            }
            bcrypt
                .compare(password, user.password)
                .then((doMatch) => {
                    if (doMatch) {
                        req.session.isLoggedIn = true
                        req.session.user = user
                        return req.session.save((err) => {
                            console.log(err)
                            res.redirect('/')
                        })
                    }
                    res.redirect('/login')
                })
                .catch((err) => {
                    console.log(err)
                    res.redirect('/login')
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

exports.getSignup = (req, res, next) => {
    let message = req.flash('error')
    if (message.length === 0) {
        message = null
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        layout: 'main-layout',
        errorMessage: message,
    })
}

exports.postSignup = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword
    User.findOne({ email: email })
        .then((userDoc) => {
            if (userDoc) {
                req.flash('error', 'Email already exists.')
                return res.redirect('/signup')
            }
            return bcryptjs
                .hash(password, 12)
                .then((hashPassword) => {
                    const user = new User({
                        email: email,
                        password: hashPassword,
                        cart: { items: [] },
                    })
                    return user.save()
                })
                .then((result) => {
                    res.redirect('/login')
                    return transporter.sendMail({
                        to: email,
                        from: 'shop@node-complete.com',
                        subject: 'Signup succeeded!',
                        html: '<h1>You successfully signed up!</h1>',
                    })
                })
        })

    .catch((err) => {
        console.log(err)
    })
}