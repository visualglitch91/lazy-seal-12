const Twit = require('twit')

module.exports = function createTwitterClient(username) {
  const _username = username.toUpperCase()

  return new Twit({
    consumer_key: process.env[`TWITTER_CONSUMER_KEY_${_username}`],
    consumer_secret: process.env[`TWITTER_CONSUMER_SECRET_${_username}`],
    access_token: process.env[`TWITTER_ACCESS_TOKEN_${_username}`],
    access_token_secret:
      process.env[`TWITTER_ACCESS_TOKEN_SECRET_${_username}`],
    timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
    strictSSL: true, // optional - requires SSL certificates to be valid.
  })
}
