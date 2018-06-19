const fs = require('fs')

function isValidVersionString(version) {
    return /\d+\.\d+\.\d+/.test(version)
}

function getRcFileVersion() {
    try {
        const rcFileContents = fs.readFileSync('.yvmrc', 'utf-8')
        return rcFileContents.replace(/[v|\n]/g, '')
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
}
