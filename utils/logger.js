module.exports = function logger(name) {
  return {
    log: (...args) => console.log(...[`(${name})`, ...args]),
    error: (...args) => console.error(...[`(${name})`, ...args])
  }
}
