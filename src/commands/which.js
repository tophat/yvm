const shell = require('shelljs')

const { getRcFileVersion } = require('../util/version')
const { error, log, success } = require('../common/log')
const { versionRootPath, yvmPath } = require('../common/utils')

const whichCommand = inputPath => {
    if (!shell.which('yarn')) {
        shell.echo('Sorry, yarn in NOT installed.')
        shell.exit(1)
    }
    const envPath = inputPath || process.env.PATH
    if (envPath === null || envPath === '') {
        return 1
    }

    let foundVersion = false

    const rcVersion = getRcFileVersion()
    const pathVariables = envPath.split(':')

    pathVariables.forEach(element => {
        if (element.startsWith(versionRootPath(yvmPath))) {
            const versionRegex = /(v\d+\.?\d*\.?\d*)/gm
            const matchedVersion = element.match(versionRegex)
            log(`Found yvm version: ${matchedVersion} in PATH ${element}`)

            const pathVersion = matchedVersion.toString().replace(/v/g, '')
            if (rcVersion !== null) {
                if (pathVersion === rcVersion) {
                    success(
                        'Your RC version matches your PATH version, good job!',
                    )
                } else {
                    error(
                        `Your RC version: ${rcVersion} and PATH version: ${pathVersion} don't match :(`,
                    )
                }
            }
            foundVersion = true
        }
        return 0
    })

    if (!foundVersion) {
        log("You don't have yvm version installed")
        return 2
    }

    return 0
}

module.exports = whichCommand
