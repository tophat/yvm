const fs = require('fs')

const LATEST_VERSION_TAG = 'latest'

function isValidVersionString(version) {
    return version === LATEST_VERSION_TAG || /\d+\.\d+\.\d+/.test(version)
}

function getRcFileVersion() {
    try {
        const rcFileContents = fs.readFileSync('.yvmrc', 'utf-8')
        return rcFileContents.replace('\n', '')
    } catch (e) {
        if (e.code === 'ENOENT') {
            return null
        }
        throw e
    }
}

module.exports = {
    getRcFileVersion,
    isValidVersionString,
    LATEST_VERSION_TAG,
}
