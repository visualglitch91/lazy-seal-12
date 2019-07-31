const fs = require('fs')
const path = require('path')
const moment = require('moment')
const mongo = require('../../utils/mongo')
const twitter = require('../../utils/twitter')

const INTERVAL = 6 * 60 * 60 * 1000
const toKeep = fs.readFileSync(path.join(__dirname, 'to-keep.txt'), 'UTF-8').split('\n')

async function main() {
  try {
    const tweets = await mongo('tweets')
      .then(collection =>
        collection.find({
          createdAt: {
            $lte: moment()
              .subtract(1, 'months')
              .toDate()
          }
        })
      )
      .then(response => response.toArray())

    console.log(`Starting to delete ${tweets.length} tweets`)

    for (let tweet of tweets) {
      console.log(`Deleting tweet ${tweet.tweetId}`)

      try {
        if (!toKeep.includes(tweet.tweetId)) {
          await twitter
            .post('statuses/destroy', { id: tweet.tweetId })
            .catch(err =>
              err.message === 'No status found with that ID.' ? null : Promise.reject(err)
            )
        }

        await mongo('tweets').then(collection => collection.deleteOne(tweet))
      } catch (err) {
        console.error(err)
      }
    }

    console.log('Tweets deleted!')
  } catch (err) {
    console.error(err)
  }

  setTimeout(main, INTERVAL)
}

main()
