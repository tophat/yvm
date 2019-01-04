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

log.colorCodes = {
    RED: '\x1b[31m%s\x1b[0m',
    GREEN: '\x1b[32m%s\x1b[0m',
    YELLOW: '\x1b[33m%s\x1b[0m',
    NONE: '\x1b[0m%s\x1b[0m',
}

module.exports = log
