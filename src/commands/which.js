const shell = require('shelljs')
const { getRcFileVersion } = require('../util/version')
const log = require('../util/log')
const { yvmPath, versionRootPath } = require('../util/utils')

const whichCommand = (inputPath, testPath = '') => {
    if (!shell.which('yarn')) {
        shell.echo('Sorry, yarn in NOT installed.')
        shell.exit(1)
    }
    const envPath = inputPath || process.env.PATH
    if (envPath === null || envPath === '') {
        return 1
    }

    const yvmPathToUse = testPath ? testPath : yvmPath

    let foundVersion = false

    const pathVariables = envPath.split(':')
    pathVariables.forEach(element => {
        if (element.startsWith(versionRootPath(yvmPathToUse))) {
            const versionRegex = /(v\d+\.?\d*\.?\d*)/gm
            const matchedVersion = element.match(versionRegex)
            log.info(
                `matched yvm version: ${matchedVersion} in PATH ${element}`,
            )

            const pathVersion = matchedVersion.toString().replace(/v/g, '')
            const rcVersion = getRcFileVersion()
            log(`Currently on yarn version ${pathVersion}`)
            if (rcVersion !== null) {
                if (pathVersion === rcVersion) {
                    log(
                        'Your .yvmrc version matches your PATH version, good job!',
                    )
                } else {
                    log(
                        `Your .yvmrc version: ${rcVersion} and PATH version: ${pathVersion} don't match :(`,
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
