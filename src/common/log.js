const chalk = require('chalk')

const defaultLogger = console.error.bind(console) // eslint-disable-line no-console
const capturableLogger = console.log.bind(console) // eslint-disable-line no-console

const log = (...args) => {
    defaultLogger(...args)
}

log.capturable = function capturableLog(...args) {
    capturableLogger(...args)
}

const error = msg => log(chalk.red(msg))
const success = msg => log(chalk.green(msg))

module.exports = {
    log,
    success,
    error,
}
