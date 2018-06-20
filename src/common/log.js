const defaultLogger = console.error.bind(console) // eslint-disable-line no-console
const capturableLogger = console.log.bind(console) // eslint-disable-line no-console

function log(...args) {
    defaultLogger(...args)
}

log.capturable = function capturableLog(...args) {
    capturableLogger(...args)
}

module.exports = log
