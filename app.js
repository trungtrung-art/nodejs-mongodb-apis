const http = require('http')

const path = require('path')
const express = require('express')
const rootDir = require('./utils/path')

const bodyParser = require('body-parser')

const mongoose = require('mongoose')

const routesAdmin = require('./routes/admin')
const routesShop = require('./routes/shop')

const errorControllers = require('./controllers/error')

// const mongoConnect = require('./utils/database').mongoConnect

const User = require('./models/user.js')

const app = express()

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
// expressjs là môi trường của nhà phát triển nó sẽ không cho phép người dùng truy cập vào các file trừ khi có sự cho phép ở đây chúng ta sẽ dùng static file của express
app.use(express.static(path.join(rootDir, 'public')))

app.use((req, res, next) => {
	User.findById('673aae95a7d4df2fe7f4bf00')
		.then((user) => {
			const { name, email, cart, _id } = user

			req.user = user
			next()
		})
		.catch((err) => {
			console.error(err)
		})
})

// START: setup middleware
app.use('/admin', routesAdmin)
app.use(routesShop)
// END: setup middleware

app.use(errorControllers.get404)

// mongoConnect(() => {
// 	app.listen('3000')
// })
mongoose
	.connect(
		'mongodb+srv://root:AnIy6PdQAhO7EIlB@test-mongo.qze0oxd.mongodb.net/shop?retryWrites=true&w=majority&appName=test-mongo',
	)
	.then((result) => {
		User.findById('673aae95a7d4df2fe7f4bf00').then((user) => {
			if (!user) {
				const user = new User({
					name: 'Trung',
					email: 'tt2861997@gmail.com',
					cart: {
						items: [],
					},
				})
				user.save()
			}
		})

		app.listen(3000)
	})
	.catch((err) => {
		console.error(err)
	})
