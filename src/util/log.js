const chalk = require('chalk')

const defaultLogger = console.error.bind(console) // eslint-disable-line no-console
const capturableLogger = console.log.bind(console) // eslint-disable-line no-console

const log = (...args) => log.default(...args)

log.default = function defaultLog(...args) {
    defaultLogger(...args)
}

log.capturable = function capturableLog(...args) {
    capturableLogger(...args)
}

log.info = function infoLog(...args) {
    if (process.env.YVM_VERBOSE) {
        log(...args)
    }
}

log.error = function errorLog(...args) {
    log(chalk.red(...args))
}

log.success = function successLog(...args) {
    log(chalk.green(...args))
}

log.notice = function noticeLog(...args) {
    log(chalk.yellow(...args))
}

module.exports = log
