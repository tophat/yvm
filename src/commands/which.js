const { getRcFileVersion } = require('../util/version')
const log = require('../common/log')

const whichCommand = () => {
    const regex = /(\/Users)(\/)((?:[a-z][a-z0-9_]*))(\/)(\.yvm)(\/versions)(\/v\d+\.?\d+\.?\d+)(\/bin)/gm
    const versionRegex = /(v\d+\.?\d*\.?\d*)/gm
    const matchedString = regex.exec(process.env.PATH)
    if (matchedString !== null) {
        const matchedPath = matchedString[0]
        const matchedVersion = matchedPath.toString().match(versionRegex)
        log(`matched yvm version: ${matchedVersion} in PATH ${matchedPath}`)

        const pathVersion = matchedVersion.toString().replace(/v/g, '')
        const rcVersion = getRcFileVersion()
        if (pathVersion === rcVersion) {
            log(`your RC version matches your PATH version, good job!`)
        } else {
            log(`your RC and PATH versions don't match :(`)
        }
    } else {
        log(`You don't have yvm version installed`)
    }
}

module.exports = whichCommand
