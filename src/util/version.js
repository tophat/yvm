const cosmiconfig = require('cosmiconfig')
const { log } = require('../common/log')

function isValidVersionString(version) {
    return /\d+\.\d+\.\d+/.test(version)
}

function getRcFileVersion() {
    const explorer = cosmiconfig('yvm')
    const result = explorer.searchSync()
    if (!result || result.isEmpty || !result.config) {
        return null
    }
    log(`Found config ${result.filepath}`)
    return result.config
}

module.exports = {
    getRcFileVersion,
    isValidVersionString,
}
