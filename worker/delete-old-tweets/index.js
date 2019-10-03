const fs = require('fs')
const path = require('path')
const moment = require('moment')
const mongo = require('../../utils/mongo')
const twitter = require('../../utils/twitter')
const logger = require('../../utils/logger')('delete-old-tweets')

const INTERVAL = 6 * 60 * 60 * 1000
const toKeep = fs.readFileSync(path.join(__dirname, 'to-keep.txt'), 'UTF-8').split('\n')
const ignoredErrors = [
  'User has been suspended.',
  'No status found with that ID.',
  'Sorry, that page does not exist.',
  'Sorry, you are not authorized to see this status.'
]

async function main() {
  try {
    const tweets = await mongo('tweets')
      .then(collection =>
        collection.find({
          createdAt: {
            $lte: moment()
              .subtract(1, 'days')
              .toDate()
          }
        })
      )
      .then(response => response.toArray())

    const tweetsToDelete = tweets.filter(tweet => !toKeep.includes(tweet.tweetId))

    logger.log(`Starting to delete ${tweetsToDelete.length} tweets`)

    for (let tweet of tweetsToDelete) {
      logger.log(`Deleting tweet ${tweet.tweetId}`)

      await twitter
        .post('statuses/destroy', { id: tweet.tweetId })
        .catch(err => (ignoredErrors.includes(err.message) ? null : Promise.reject(err)))
        .then(() => mongo('tweets'))
        .then(collection => collection.deleteOne(tweet))
        .catch(logger.error)
    }

    logger.log('Tweets deleted!')
  } catch (err) {
    logger.error(err)
  }

  setTimeout(main, INTERVAL)
}

main()
