const { mongodb, ObjectId } = require('mongodb')
const { getDb } = require('../utils/database')

class User {
	constructor(username, email, cart, id) {
		this.name = username
		this.email = email
		this.cart = cart // {items: []}
		this._id = id
	}

	save() {
		const db = getDb()
		return db.collection('users').insertOne(this)
	}

	addToCart(product) {
		const cartProductIndex = this.cart.items.findIndex((cp) => {
			return cp.productId.toString() === product._id.toString()
		})

		let newQuantity = 1
		let updatedCardItems = [...this.cart.items]
		if (cartProductIndex >= 0) {
			newQuantity = this.cart.items[cartProductIndex].quantity + 1
			updatedCardItems[cartProductIndex].quantity = newQuantity
		} else {
			updatedCardItems.push({
				productId: new ObjectId(product._id),
				quantity: newQuantity,
			})
		}
		const updatedCart = {
			items: updatedCardItems,
		}

		const db = getDb()
		return db
			.collection('users')
			.updateOne(
				{ _id: new ObjectId(this._id) },
				{ $set: { cart: updatedCart } },
			)
	}

	static findById(userId) {
		const db = getDb()
		return db
			.collection('users')
			.findOne({ _id: new ObjectId(userId) })
			.then((user) => {
				return user
			})
			.catch((error) => {
				console.error(error)
			})
	}
}

module.exports = User
