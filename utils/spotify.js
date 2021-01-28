const SpotifyWebApi = require('spotify-web-api-node')

let clientPromise

module.exports = function getSpotifyClient() {
  if (!clientPromise) {
    clientPromise = new Promise((resolve, reject) => {
      const spotifyApi = new SpotifyWebApi({
        redirectUri: 'http://localhost:3000/spotify-callback',
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        refreshToken: process.env.SPOTIFY_REFRESH_TOKEN,
      })

      spotifyApi
        .refreshAccessToken()
        .then((data) => data.body['access_token'])
        .then((token) => spotifyApi.setAccessToken(token))
        .then(() => resolve(spotifyApi))
        .catch(reject)
    })
  }

  return clientPromise
}
