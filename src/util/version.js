const cosmiconfig = require('cosmiconfig')
const log = require('../common/log')

function isValidVersionString(version) {
    return /\d+\.\d+\.\d+/.test(version)
}

function getRcFileVersion() {
    const explorer = cosmiconfig('yvm')
    const result = explorer.searchSync()
    if (!result || result.isEmpty || !result.config) {
        return null
    }
    log.info(`Found config ${result.filepath}`)
    return result.config
}

function validateVersionString(versionString) {
    if (versionString === null) {
        throw new Error(
            `No yarn version supplied!\nTry adding a config file (.yvmrc) or specify your version in the command like this:\nyvm exec 1.0.2 install`,
        )
    }
    if (!isValidVersionString(versionString) && versionString !== null) {
        throw new Error(`Invalid yarn version supplied: ${versionString}`)
    }
}

module.exports = {
    isValidVersionString,
    getRcFileVersion,
    validateVersionString,
}
