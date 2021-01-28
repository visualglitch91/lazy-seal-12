const getSpotifyClient = require('../../utils/spotify')

function transferMyPlayback() {
  return getSpotifyClient().then((spotify) => {
    spotify
      .getMyDevices()
      .then((data) => data.body.devices)
      .then((devices) =>
        devices.find(
          (it) => it.name === process.env.SPOTIFY_COMPUTER_DEVICE_NAME
        )
      )
      .then((device) => spotify.transferMyPlayback([device.id]))
  })
}

module.exports = async function hrLocker(_, res) {
  transferMyPlayback().then(
    () => res.sendStatus(204),
    (err) => res.status(500).send(err)
  )
}
