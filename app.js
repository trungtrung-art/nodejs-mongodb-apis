const http = require('http')

const path = require('path')
const express = require('express')
const rootDir = require('./utils/path')

const bodyParser = require('body-parser')

const mongoose = require('mongoose')

const session = require('express-session')

const routesAdmin = require('./routes/admin')
const routesShop = require('./routes/shop')
const routesAuth = require('./routes/auth')
const errorControllers = require('./controllers/error')

const MongoDBStore = require('connect-mongodb-session')(session)
const csrf = require('csurf')
const flash = require('connect-flash')
const multer = require('multer')

// const mongoConnect = require('./utils/database').mongoConnect

const User = require('./models/user.js')

const MONGODB_URI =
    'mongodb+srv://root:AnIy6PdQAhO7EIlB@test-mongo.qze0oxd.mongodb.net/shop?w=majority&appName=test-mongo'

const app = express()

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions',
})
const csrfProtection = csrf()

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname)
    },
})

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

// app.engine(
//   "hbs",
//   expressHbs({
//     layoutsDir: "views/layout/",
//     defaultLayout: "main-layout",
//     extname: "hbs",
//   })
// );
// Chúng ta sẽ có các view engine tiêu biểu như hbs,pug,ejs tuỳ vào cấu hình khác nhau để setup
app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(
        multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'),
    )
    // expressjs là môi trường của nhà phát triển nó sẽ không cho phép người dùng truy cập vào các file trừ khi có sự cho phép ở đây chúng ta sẽ dùng static file của express
app.use(express.static(path.join(rootDir, 'public')))
app.use('/images', express.static(path.join(rootDir, 'images')))
app.use(
    session({
        secret: 'my secret',
        resave: false,
        saveUninitialized: false,
        store: store,
    }),
)
app.use(csrfProtection)
app.use(flash())

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn
    res.locals.csrfToken = req.csrfToken()
    next()
})

app.use((req, res, next) => {
    if (!req.session.user) {
        return next()
    }
    User.findById(req.session.user._id)
        .then((user) => {
            if (!user) {
                return next()
            }
            req.user = user

            next()
        })
        .catch((err) => {
            next(new Error(err))
        })
})

// START: setup middleware
app.use('/admin', routesAdmin)
app.use(routesShop)
app.use(routesAuth)
    // END: setup middleware

app.get('/500', errorControllers.get500)

app.use(errorControllers.get404)

app.use((error, req, res, next) => {
    res.status(500).render('500', {
        pageTitle: 'Error!',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn,
    })
})

// mongoConnect(() => {
// 	app.listen('3000')
// })
mongoose
    .connect(MONGODB_URI)
    .then((result) => {
        app.listen(3000)
    })
    .catch((err) => {
        console.error(err)
    })