const { TwitterApi } = require('twitter-api-v2')

module.exports = function createTwitterClient(username) {
  const _username = username.toUpperCase()
  const version = process.env[`TWITTER_API_VERSION_${_username}`]

  const client = new TwitterApi({
    appKey: process.env[`TWITTER_CONSUMER_KEY_${_username}`],
    appSecret: process.env[`TWITTER_CONSUMER_SECRET_${_username}`],
    accessToken: process.env[`TWITTER_ACCESS_TOKEN_${_username}`],
    accessSecret: process.env[`TWITTER_ACCESS_TOKEN_SECRET_${_username}`],
  })[version]

  if (version === 'v1') {
    client.me = function me() {
      return client.verifyCredentials().then((user) => ({
        data: {
          id: user.id_str,
          name: user.name,
          username: user.screen_name,
        },
      }))
    }
  }

  return client
}
