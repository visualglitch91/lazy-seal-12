const logger = require('../../utils/logger')('ping')

module.exports = function ping(_, res) {
  res.sendStatus(204)
}
