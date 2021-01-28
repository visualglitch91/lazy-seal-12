const getSpotifyClient = require('../../utils/spotify')

function spotify(method, ...args) {
  return getSpotifyClient().then((spotify) => spotify[method](...args))
}

function transferMyPlayback() {
  return spotify('getMyDevices')
    .then((data) => data.body.devices)
    .then((devices) =>
      devices.find((it) => it.name === process.env.SPOTIFY_COMPUTER_DEVICE_NAME)
    )
    .then((device) => spotify('transferMyPlayback', [device.id]))
}

module.exports = async function hrLocker(req, res) {
  const { action } = req.body

  try {
    switch (action) {
      case 'transfer_to_computer':
        await transferMyPlayback()
        break
      case 'play':
        await spotify('play')
        break
      case 'pause':
        await spotify('pause')
        break
      case 'skip_to_previous':
        await spotify('skipToPrevious')
        break
      case 'skip_to_next':
        await spotify('skipToNext')
        break
    }

    return res.sendStatus(204)
  } catch (err) {
    return res.status(500).send(err)
  }
}
