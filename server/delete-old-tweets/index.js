const fs = require('fs')
const path = require('path')
const moment = require('moment')
const twitter = require('../../utils/twitter')
const logger = require('../../utils/logger')('delete-old-tweets')

const INTERVAL = 6 * 60 * 60 * 1000

const toKeep = fs
  .readFileSync(path.join(__dirname, 'to-keep.txt'), 'UTF-8')
  .split('\n')

const ignoredErrors = [
  'User has been suspended.',
  'No status found with that ID.',
  'Sorry, that page does not exist.',
  'Sorry, you are not authorized to see this status.',
]

async function getLatest3200Tweets() {
  let tweets = []

  async function next(maxId) {
    const response = await twitter.get('statuses/user_timeline', {
      max_id: maxId,
      include_rts: true,
      user_id: '69746799',
      count: 200,
    })

    if (response.data.length <= 1) {
      return tweets
    }

    tweets = [...tweets, ...response.data]

    return next(response.data[response.data.length - 1].id_str)
  }

  return next()
}

async function main() {
  try {
    const until = moment().subtract(7, 'days').toDate()

    const tweets = await getLatest3200Tweets()

    const tweetsToDelete = tweets
      .filter((tweet) => new Date(tweet.created_at) < until)
      .filter((tweet) => !toKeep.includes(tweet.id_str))

    logger.log(`Starting to delete ${tweetsToDelete.length} tweets`)

    for (let tweet of tweetsToDelete) {
      logger.log(`Deleting tweet ${tweet.id_str}`)

      await twitter
        .post('statuses/destroy', { id: tweet.id_str })
        .catch((err) =>
          ignoredErrors.includes(err.message) ? null : Promise.reject(err)
        )
        .catch(logger.error)
    }

    logger.log('Tweets deleted!')
  } catch (err) {
    logger.error(err)
  }

  setTimeout(main, INTERVAL)
}

module.exports = function deleteOldTweets(_, res) {
  main()
  res.sendStatus(204)
}
