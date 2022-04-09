require('dotenv').config()

const express = require('express')
const SpotifyWebApi = require('spotify-web-api-node')

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: 'http://localhost:3000/spotify-auth-callback',
})

const authorizeURL = spotifyApi.createAuthorizeURL([
  'user-modify-playback-state',
  'user-read-playback-state',
  'user-read-currently-playing',
])

const app = express()

app.get('/spotify-auth-callback', (req, res) => {
  const code = req.query.code

  spotifyApi.authorizationCodeGrant(code).then(
    (data) => res.send(data.body['refresh_token']),
    () => res.sendStatus(500)
  )
})

app.listen(3000, () => {
  console.log('Listening on', 3000)
  console.log(`Go to ${authorizeURL}`)
})
