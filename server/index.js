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

app.post('/spotify', require('./spotify'))
app.post('/delete-old-tweets', require('./delete-old-tweets'))

app.listen(port, () => console.log('Listening on', port))
