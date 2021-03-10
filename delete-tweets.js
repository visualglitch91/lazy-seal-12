require('dotenv').config()
const deleteTweets = require('./server/delete-old-tweets').main

deleteTweets(10, 'hours')
