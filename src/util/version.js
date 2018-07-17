const cosmiconfig = require('cosmiconfig')
const shell = require('shelljs')

const { log } = require('../common/log')
const { versionRootPath, yvmPath } = require('../common/utils')

function isValidVersionString(version) {
    return /\d+\.\d+\.\d+/.test(version)
}

function getRcFileVersion() {
    const explorer = cosmiconfig('yvm')
    const result = explorer.searchSync()
    if (!result || result.isEmpty || !result.config) {
        return null
    }
    log.info(`Found config ${result.filepath}`)
    return result.config
}

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

function validateVersionString(versionString) {
    if (versionString === null) {
        throw new Error(
            `No yarn version supplied!\nTry adding a config file (.yvmrc) or specify your version in the command like this:\nyvm exec 1.0.2 install`,
        )
    }
    if (!isValidVersionString(versionString) && versionString !== null) {
        throw new Error(`Invalid yarn version supplied: ${versionString}`)
    }
}

module.exports = {
    extractYarnVersionsFromPath,
    getRcFileVersion,
    isValidVersionString,
    validateVersionString,
}
