const os = require('os')
const path = require('path')

const isFishShell = shell => shell === 'fish'

const getPathDelimiter = shell => {
    if (isFishShell(shell)) {
        return ' '
    }
    return path.delimiter
}

const getCurrentPath = shell => {
    if (isFishShell(shell)) {
        return process.env.FISH_USER_PATHS || ''
    }
    return process.env.PATH || ''
}

const getPathEntries = shell => {
    return getCurrentPath(shell).split(getPathDelimiter(shell))
}

const yvmPath = process.env.YVM_DIR || path.resolve(os.homedir(), '.yvm')

module.exports = {
    getCurrentPath,
    getPathDelimiter,
    getPathEntries,
    yvmPath,
}
