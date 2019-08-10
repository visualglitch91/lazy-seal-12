const { Observable, Subject, interval, merge, of, from, race } = require('rxjs')
const { map, flatMap, distinct, zip, tap, filter, bufferTime, count } = require('rxjs/operators')
const twitter = require('../../utils/twitter')
const logger = require('../../utils/logger')('twitter-mass-blocker')

const config = JSON.parse(process.env.TWITTER_MASS_BLOCKER_CONFIG)
const initialCursor = process.env.TWITTER_MASS_BLOCKER_INITIAL_CURSOR

/*
 * config should be an object like this
 * {
 *   maxRounds: number
 *   targetUsername: string
 *   minFollowerCount: number
 *   minStatusesCount: number
 *   keywords: [string]
 * }
 */

const FOLLOWERS_INTERVAL = (60 + 1) * 1000
const RETRY_INTERVAL = 15 * 60 * 1000
const BLOCK_INTERVAL = 1000

const identity = x => x

const formatUser = user => `${user.screen_name} <${user.id_str}>`

function main(cursor = -1, round = 0) {
  let nextCursor

  logger.log(`Fetching followers for cursor ${cursor}, round ${round}`)
  from(
    twitter.get('/followers/ids', {
      screen_name: config.targetUsername,
      stringify_ids: true,
      cursor: cursor,
      count: 5000
    })
  )
    .pipe(
      tap(response => {
        nextCursor = response.data.next_cursor_str

        if (nextCursor === '0') {
          nextCursor = null
        }
      }),
      map(response => response.data.ids),
      flatMap(identity),
      bufferTime(2000, null, 100),
      filter(ids => ids.length > 0),
      flatMap(ids =>
        twitter
          .get('/users/lookup', { user_id: ids.join(','), include_blocking: true })
          .then(response => response.data, error => logger.log(error.message) || [])
      ),
      flatMap(identity),
      filter(
        user =>
          user.default_profile_image ||
          user.followers_count < config.minFollowerCount ||
          user.statuses_count < config.minStatusesCount ||
          /^\d+$/.test(user.screen_name.slice(-8)) ||
          config.keywords.reduce((match, word) => {
            if (
              user.name.toLowerCase().includes(word) ||
              user.screen_name.toLowerCase().includes(word) ||
              user.description.toLowerCase().includes(word)
            ) {
              return true
            }

            return match
          }, false)
      ),
      filter(user => !user.following),
      filter(user => !user.blocking),
      zip(interval(BLOCK_INTERVAL), x => x)
    )
    .subscribe({
      next: user => {
        twitter
          .post('/blocks/create', { user_id: user.id_str })
          .then(() => logger.log(`${formatUser(user)} blocked`))
      },
      complete: () => {
        if (nextCursor && round < config.maxRounds) {
          setTimeout(main, FOLLOWERS_INTERVAL, nextCursor, round + 1)
        } else {
          setTimeout(main, FOLLOWERS_INTERVAL, -1, 0)
        }
      },
      error: error => {
        if (error.message === 'Rate limit exceeded') {
          logger.log(error.message)
          setTimeout(main, RETRY_INTERVAL, cursor, round)
        } else {
          logger.error(error.message)
        }
      }
    })
}

main(initialCursor)
