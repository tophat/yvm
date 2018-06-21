const { getRcFileVersion } = require('../util/version')
const log = require('../common/log')
const { versionRootPath } = require('../common/utils')
const shell = require('shelljs')

const whichCommand = inputPath => {
    if (!shell.which('yarn')) {
        shell.echo('Sorry, yarn in NOT installed.')
        shell.exit(1)
    }
    const envPath = inputPath || process.env.PATH
    if (envPath === null || envPath === '') {
        process.exit(1)
    }

    const pathVariables = envPath.split(':')
    pathVariables.forEach(element => {
        if (element.startsWith(versionRootPath)) {
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
            process.exit(0)
        }
    })

    log(`You don't have yvm version installed`)
    process.exit(1)
}

module.exports = whichCommand
