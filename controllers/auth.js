const bcryptjs = require('bcryptjs')
const User = require('../models/user')
const bcrypt = require('bcryptjs/dist/bcrypt')
const { validationResult } = require('express-validator')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const crypto = require('crypto')
require('dotenv').config()

const transporter = nodemailer.createTransport(
    sendgridTransport({
        auth: {
            api_key: process.env.API_SENDMAIL,
        },
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
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log(errors.array())
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            layout: 'main-layout',
            errorMessage: errors.array(),
        })
    }
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

exports.getReset = (req, res, next) => {
    let message = req.flash('error')
    if (message.length === 0) {
        message = null
    }
    res.render('auth/reset', {
        pageTitle: 'Reset Password',
        path: '/reset',
        layout: 'main-layout',
        errorMessage: message,
    })
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err)
            return res.redirect('/reset')
        }
        const token = buffer.toString('hex')
        User.findOne({ email: req.body.email })
            .then((user) => {
                if (!user) {
                    req.flash('error', 'No account with that email found.')
                    return res.redirect('/reset')
                }
                user.resetToken = token
                user.resetTokenExpiration = Date.now() + 360000
                return user.save()
            })
            .then((result) => {
                res.redirect('/')
                transporter.sendMail({
                    to: req.body.email,
                    from: 'shop@node-complete.com',
                    subject: 'Password reset',
                    html: `
                        <p>You requested a password reset</p>
                        <p>Click this <a href="https://localhost:3000/reset/${token}">link</a> to set a new password</p>
                    `,
                })
            })
            .catch((err) => {
                console.log(err)
            })
    })
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token

    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then((user) => {
            let message = req.flash('error')
            if (message.length === 0) {
                message = null
            }
            res.render('auth/new-password', {
                pageTitle: 'New Password',
                path: '/new-password',
                layout: 'main-layout',
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token,
            })
        })
        .catch((err) => {
            console.log(err)
        })
}

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password
    const userId = req.body.userId
    const passwordToken = req.body.passwordToken
    let resetUser
    User.findOne({
            resetToken: passwordToken,
            resetTokenExpiration: { $gt: Date.now() },
            _id: userId,
        })
        .then((user) => {
            resetUser = user
            return bcrypt.hash(newPassword, 12)
        })
        .then((hashedPassword) => {
            resetUser.password = hashedPassword
            resetUser.resetToken = undefined
            resetUser.resetTokenExpiration = undefined
            return resetUser.save()
        })
        .then((result) => {
            res.redirect('/login')
        })
        .catch((err) => {
            console.log(err)
        })
}