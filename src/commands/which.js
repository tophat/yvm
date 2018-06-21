const { getRcFileVersion } = require('../util/version')
const log = require('../common/log')
const { yvmPath, versionRootPath } = require('../common/utils')
const shell = require('shelljs')

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

    const pathVariables = envPath.split(':')
    pathVariables.forEach(element => {
        if (element.startsWith(versionRootPath(yvmPath))) {
            const versionRegex = /(v\d+\.?\d*\.?\d*)/gm
            const matchedVersion = element.match(versionRegex)
            log(`matched yvm version: ${matchedVersion} in PATH ${element}`)

            const pathVersion = matchedVersion.toString().replace(/v/g, '')
            const rcVersion = getRcFileVersion()
            if (rcVersion !== null) {
                if (pathVersion === rcVersion) {
                    log(`your RC version matches your PATH version, good job!`)
                } else {
                    log(
                        `your RC version: ${rcVersion} and PATH version: ${pathVersion} don't match :(`,
                    )
                }
            }
            foundVersion = true
            return 0
        }
        return 1
    })

    if (!foundVersion) {
        log(`You don't have yvm version installed`)
        return 2
    }

    return 0
}

module.exports = whichCommand
