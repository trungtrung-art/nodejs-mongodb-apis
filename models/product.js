const mongodb = require("mongodb")
const { getDb } = require("../utils/database");

class Product {
  constructor(title, imageUrl, price, description, id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id;
    this.userId = userId
  }
  save() {
    const db = getDb();
    let dbOp
    if (this._id) {
      // Update product
      dbOp = db.collection('products').updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: this })
    } else {
      // Add new product
      dbOp = db.collection('products').insertOne(this)
    }

    return dbOp
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  static fetchAll() {
    const db = getDb();
    return db
      .collection("products")
      .find()
      .toArray()
      .then((products) => {
        console.log(products);
        return products;
      })
      .catch((err) => {
        console.error(err);
      });
  }

  static findById(prodId) {
    const db = getDb();
    return db.collection('products').find({ _id: new mongodb.ObjectId(prodId) }).next().then(
      product => {
        console.log(product);
        return product;
      }
    ).catch(err => {
      console.error(err)
    })
  }

  static deleteById(prodId) {
    const db = getDb();
    return db.collection('products').deleteOne({ _id: new mongodb.ObjectId(prodId) }).then(
      result => {
        console.log('delete successfully')
      }
    ).catch(err => {
      console.error(err)
    })
  }
}

module.exports = Product;
