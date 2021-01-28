require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')

const port = process.env.PORT || 3000
const secretToken = process.env.SECRET_TOKEN

const app = express()

app.use(bodyParser.json())

app.use((req, res, next) => {
  if (secretToken !== req.body.token) {
    return res.sendStatus(401)
  } else {
    return next()
  }
})

// app.post('/instagram-to-twitter', require('./instagram-to-twitter'))
// app.post('/save-tweet', require('./save-tweet'))
app.post('/ping', require('./ping'))
app.post('/delete-old-tweets', require('./delete-old-tweets'))
app.post('/hr-locker', require('./hr-locker'))
app.post('/spotify', require('./spotify'))

app.listen(port, () => console.log('Listening on', port))
