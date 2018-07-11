const cosmiconfig = require('cosmiconfig')
const log = require('./log')

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

// eslint-disable-next-line consistent-return
const getSplitVersionAndArgs = (maybeVersionArg, ...rest) => {
    if (maybeVersionArg) {
        if (isValidVersionString(maybeVersionArg)) {
            log(`Using provided version: ${maybeVersionArg}`)
            return [maybeVersionArg, rest]
        }
    }

    rest.unshift(maybeVersionArg)

    try {
        const version = getRcFileVersion()
        validateVersionString(version)
        log(`Using yarn version: ${version}`)
        return [version, rest]
    } catch (e) {
        log(e.message)
        process.exit(1)
    }
}

module.exports = {
    getRcFileVersion,
    getSplitVersionAndArgs,
    validateVersionString,
}
