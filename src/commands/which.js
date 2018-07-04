const shell = require('shelljs')

const { getRcFileVersion } = require('../util/version')
const { error, log, success } = require('../common/log')
const { versionRootPath, yvmPath } = require('../common/utils')

const extractYarnVersionsFromPath = envPath => {
    if (!shell.which('yarn')) {
        return null
    }

    if (envPath === null || envPath === '') {
        return null
    }

    const pathVariables = envPath.split(':')
    const possibleVersionPaths = pathVariables.filter(entry =>
        entry.startsWith(versionRootPath(yvmPath)),
    )

    const versionRegex = /v(\d+\.?\d*\.?\d*)/gm
    const versions = possibleVersionPaths.map(path => {
        const versionNumber = versionRegex.exec(path)[1]
        return {
            number: versionNumber,
            path,
        }
    })

    return versions
}

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
