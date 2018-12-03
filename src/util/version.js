const fs = require('fs')
const path = require('path')
const cosmiconfig = require('cosmiconfig')
const log = require('./log')
const { yvmPath: defaultYvmPath } = require('./utils')

function isValidVersionString(version) {
    return /^\d+\.\d+\.\d+$/.test(version)
}

function getDefaultVersion(yvmPath = defaultYvmPath) {
    const versionStoragePath = path.join(yvmPath, '.default-version')
    try {
        const versionJSONString = fs.readFileSync(versionStoragePath, 'utf8')
        const versionJSON = JSON.parse(versionJSONString)
        const version = versionJSON.defaultVersion
        if (!version) {
            throw new Error(
                `Version JSON exists but contains no key 'defaultVersion'`,
            )
        }
        return version
    } catch (e) {
        log.info('Unable to determine default version')
        log.info(e)
        return undefined
    }
}

function setDefaultVersion({ version, yvmPath = defaultYvmPath }) {
    const versionStoragePath = path.join(yvmPath, '.default-version')

    const jsonObject = { defaultVersion: version }
    const content = JSON.stringify(jsonObject)
    try {
        fs.writeFileSync(versionStoragePath, content)
        return true
    } catch (e) {
        log('Unable to set default version')
        log(e)
        return false
    }
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

// eslint-disable-next-line consistent-return
const getSplitVersionAndArgs = (maybeVersionArg, ...rest) => {
    if (maybeVersionArg) {
        if (isValidVersionString(maybeVersionArg)) {
            log.info(`Using provided version: ${maybeVersionArg}`)
            return [maybeVersionArg, rest]
        }
    }

    rest.unshift(maybeVersionArg)

    try {
        const rcVersion = getRcFileVersion()
        let versionToUse
        if (rcVersion) {
            if (!isValidVersionString(rcVersion)) {
                throw new Error(
                    `Invalid yarn version found in .yarnrc: ${rcVersion}`,
                )
            }
            versionToUse = rcVersion
        } else {
            versionToUse = getDefaultVersion()
        }

        if (!versionToUse) {
            throw new Error(
                `No yarn version supplied!
Try:
    Setting a global default version (yvm set-default 1.9.2)
    Adding .yvmrc file in this directory or a parent directory
    Specify your version in the command.`,
            )
        }
        log.info(`Using yarn version: ${versionToUse}`)
        return [versionToUse, rest]
    } catch (e) {
        log(e.message)
        process.exit(1)
    }
}

module.exports = {
    getRcFileVersion,
    getSplitVersionAndArgs,
    getDefaultVersion,
    setDefaultVersion,
    isValidVersionString,
}
