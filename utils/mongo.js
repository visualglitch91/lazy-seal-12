const { MongoClient } = require('mongodb')

const url = process.env.MONGODB_URI
let clientPromise

module.exports = function getCollection(name, callback) {
  if (!clientPromise) {
    clientPromise = MongoClient.connect(url, { useNewUrlParser: true })
  }

  return clientPromise.then(client => client.db('heroku_h6bxm0c6')).then(db => db.collection(name))
}
