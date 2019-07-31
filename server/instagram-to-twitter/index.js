const axios = require('axios')
const twitter = require('../../utils/twitter')

const altRegex = /\"accessibility_caption\":\"(.*?)\",\"is_video\"/
const captionRegex = /\"edge_media_to_caption\":\{\"edges\":\[\{\"node\":\{\"text\":\"(.*?)\"\}\}\]\},\"caption_is_edited\"/gm

function decode(str) {
  return decodeURIComponent(JSON.parse('"' + str.replace(/\"/g, '\\"') + '"'))
}

module.exports = function instagramToTwitterHandler(req, res) {
  const { url, imageUrl } = req.body

  // Respond early to avoid timeout
  res.sendStatus(200)

  console.log(`Sending instagram pic ${url} to twitter`)

  axios
    .get(url, { responseType: 'text' })
    .then(response => response.data)
    .then(body => {
      const alt = (altRegex.exec(body) || [])[1]
      const caption = (captionRegex.exec(body) || [])[1]

      if (!alt || !caption) {
        throw new Error('Caption or alt text not found.')
      }

      return [decode(alt), decode(caption)]
    })
    .then(([alt, caption]) =>
      axios
        .get(imageUrl, { responseType: 'arraybuffer' })
        .then(response => response.data)
        .then(image => Buffer.from(image, 'binary').toString('base64'))
        .then(image => twitter.post('media/upload', { media_data: image }))
        .then(response => response.data.media_id_string)
        .then(mediaId =>
          twitter
            .post('media/metadata/create', {
              media_id: mediaId,
              alt_text: { text: alt }
            })
            .then(() => mediaId)
        )
        .then(mediaId => {
          const status = caption.includes('ph by @lalis.ph')
            ? caption.replace('ph by @lalis.ph', `ph by @Laisanhade4bjs\n\n${url}\n`)
            : `${caption}\n\n${url}`

          return twitter.post('statuses/update', { status, media_ids: [mediaId] })
        })
    )
    .catch(err => {
      console.error(err)
    })
}
