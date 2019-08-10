const moment = require('moment')
const mongo = require('../../utils/mongo')
const logger = require('../../utils/logger')('save-tweet')

function parseDate(str) {
  return moment(str, 'MMMM D, YYYY at hh:mmA').toDate()
}

module.exports = function saveTweet(req, res) {
  const { url, createdAt } = req.body
  const tweetId = url.split('/').pop()

  logger.log(`Saving tweet ${tweetId}, posted at ${createdAt}`)

  mongo('tweets')
    .then(collection =>
      collection.insertOne({
        tweetId,
        createdAt: parseDate(createdAt)
      })
    )
    .then(
      () => res.sendStatus(201),
      err => {
        logger.error(err)
        res.sendStatus(500)
      }
    )
}
