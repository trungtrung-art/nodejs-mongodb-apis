const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const ServerApiVersion = mongodb.ServerApiVersion;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb+srv://root:AnIy6PdQAhO7EIlB@test-mongo.qze0oxd.mongodb.net/?retryWrites=true&w=majority&appName=test-mongo",
    {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    }
  )
    .then((client) => {
      console.log("connected");
      _db = client.db();
      callback(client);
    })
    .catch((err) => {
      console.error("ket noi database that bai");
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "no database found !";
};

module.exports = {
  mongoConnect,
  getDb,
};
