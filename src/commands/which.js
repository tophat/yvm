const { error, log, success } = require('../common/log')
const { extractYarnVersionsFromPath } = require('../util/version')
const { getRcFileVersion } = require('../util/version')

const whichCommand = inputPath => {
    const envPath = inputPath || process.env.PATH
    const versions = extractYarnVersionsFromPath(envPath)

    if (versions.length === 0) {
        error("Yarn version not detected in PATH. Please run 'yvm use'")
        return 1
    }

    if (versions.length > 1) {
        error(
            'More than one Yarn version detected in PATH! Manually edit the PATH to remove the extra versions',
        )
        return 1
    }

    const { number, path } = versions[0]
    log(`Found yvm version: ${number} in PATH ${path}`)

    const rcVersion = getRcFileVersion()
    if (rcVersion !== null) {
        if (number === rcVersion) {
            success('Your RC version matches your PATH version, good job!')
            return 0
        }
        error(
            `Your RC version: ${rcVersion} and PATH version: ${number} don't match :(`,
        )

        return 2
    }

    return 0
}

module.exports = whichCommand
