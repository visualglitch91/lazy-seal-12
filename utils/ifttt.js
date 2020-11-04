const axios = require('axios')

function trigger(event, data) {
  if (process.env.IFTTT_WEBHOOK) {
    axios.post(process.env.IFTTT_WEBHOOK.replace('{{EVENT}}', event), data)
  }
}

function telegramMessage(value1, value2, value3) {
  trigger('telegram_message', { value1, value2, value3 })
}

function reportError(message, error) {
  telegramMessage('lazy seal errored', message, JSON.stringify(error, null, 2))
}

function pushNotification(message) {
  trigger('push_notification', { value1: message })
}

module.exports = {
  trigger,
  telegramMessage,
  reportError,
  pushNotification,
}
