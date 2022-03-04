const fs = require('fs')
const path = require('path')
const moment = require('moment')
const uniqBy = require('lodash/uniqBy')
const createTwitterClient = require('../../utils/twitter')
const logger = require('../../utils/logger')('delete-old-tweets')

const toKeep = fs
  .readFileSync(path.join(__dirname, 'to-keep.txt'), 'UTF-8')
  .split('\n')

const ignoredErrors = [
  'User has been suspended.',
  'No status found with that ID.',
  'Sorry, that page does not exist.',
  'Sorry, you are not authorized to see this status.',
]

async function getLatest3200Tweets(twitter) {
  const { data: user } = await twitter.me()

  const userTimeline = await twitter.userTimeline(user.id, {
    'tweet.fields': ['created_at'],
  })

  // await userTimeline.fetchLast(3200)

  // normalize v1 ids
  let tweets = userTimeline.tweets.map((it) => ({
    id: it.id_str || it.id,
    created_at: it.created_at,
    text: it.full_text || it.text,
  }))

  // remove duplicated tweets
  tweets = uniqBy(tweets, 'id')

  return tweets
}

async function main(username, ttl) {
  try {
    const until = moment()
      .subtract(...ttl)
      .toDate()

    const twitter = createTwitterClient(username)

    const tweets = await getLatest3200Tweets(twitter)

    const tweetsToDelete = tweets
      .filter((tweet) => new Date(tweet.created_at) < until)
      .filter((tweet) => !toKeep.includes(tweet.id))

    logger.log(`Starting to delete ${tweetsToDelete.length} tweets`)

    for (let tweet of tweetsToDelete) {
      logger.log(`Deleting tweet ${tweet.id}`)

      await twitter
        .deleteTweet(tweet.id)
        .catch((err) =>
          ignoredErrors.includes(err.message) ? null : Promise.reject(err)
        )
        .catch(logger.error)
    }

    logger.log('Tweets deleted!')
  } catch (err) {
    logger.error(err)
    ifttt.reportError(`delete-old-tweets`, err)
  }
}

module.exports = function deleteOldTweets(req, res) {
  main(req.body.username, req.body.ttl)
  res.sendStatus(204)
}

module.exports.main = main
