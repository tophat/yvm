const defaultLogger = console.error.bind(console) // eslint-disable-line no-console
const capturableLogger = console.log.bind(console) // eslint-disable-line no-console

function log(...args) {
    defaultLogger(...args)
}

log.capturable = function capturableLog(...args) {
    capturableLogger(...args)
}

log.info = function errorLog(...args) {
    if (process.env.YVM_VERBOSE) {
        log(...args)
    }
}

module.exports = log
