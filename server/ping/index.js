const logger = require("../../utils/logger")("ping");

module.exports = function ping(req, res) {
  res.sendStatus(204);
};
