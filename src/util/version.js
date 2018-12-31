const fs = require('fs')
const path = require('path')
const { exec } = require('shelljs')
const cosmiconfig = require('cosmiconfig')

const log = require('./log')
const { yvmPath: defaultYvmPath } = require('./path')
const { stripVersionPrefix, versionRootPath } = require('./utils')
const DEFAULT_VERSION_TEXT = 'Global Default'
const VERSION_IN_USE_SYMBOL = '\u2713'
const VERSION_INSTALLED_SYMBOL = '\u2192'

function isValidVersionString(version) {
    return /\d+(\.\d+){2}(.*)/.test(version)
}

function getValidVersionString(version) {
    const parsedVersionString = version.match(/\d+(\.\d+){2}(.*)/)
    return parsedVersionString ? parsedVersionString[0] : null
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

function getVersionInUse() {
    return new Promise(resolve => {
        exec(
            'yarn --version',
            { async: true, silent: true },
            (code, stdout) => {
                const versionInUse = stdout
                resolve(versionInUse)
            },
        )
    })
}

function getYarnVersions(yvmPath = defaultYvmPath) {
    const versionsPath = versionRootPath(yvmPath)
    if (fs.existsSync(versionsPath)) {
        const re = /^v(\d+\.)(\d+\.)(\d+)$/
        const files = fs.readdirSync(versionsPath)
        return files.filter(file => re.test(file)).map(stripVersionPrefix)
    }
    return []
}

// eslint-disable-next-line consistent-return
const getSplitVersionAndArgs = (maybeVersionArg, ...rest) => {
    if (maybeVersionArg) {
        const parsedVersionString = getValidVersionString(maybeVersionArg)
        if (parsedVersionString) {
            log.info(`Using provided version: ${maybeVersionArg}`)
            return [parsedVersionString, rest]
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
            versionToUse = getValidVersionString(rcVersion)
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

const printVersions = ({
    list,
    message,
    versionInUse = '',
    defaultVersion = getDefaultVersion(defaultYvmPath),
    localVersions = [],
}) => {
    log(message)

    versionInUse = versionInUse.trim()

    const versionsMap = {}

    list.forEach(versionPadded => {
        const version = versionPadded.trim()
        const isCurrent = version === versionInUse
        const isDefault = version === defaultVersion
        const isInstalled = localVersions.includes(version)

        let toLog = ' '
        if (isCurrent) toLog += VERSION_IN_USE_SYMBOL
        else if (isInstalled) toLog += VERSION_INSTALLED_SYMBOL
        else toLog += '-'
        toLog += ` ${versionPadded}`

        if (isDefault) toLog += ` (${DEFAULT_VERSION_TEXT})`

        const logArgs = []
        if (isCurrent) logArgs.push('\x1b[32m%s\x1b[0m')
        else if (isInstalled) logArgs.push('\x1b[33m%s\x1b[0m')
        log(...logArgs, toLog)

        versionsMap[version] = toLog
    })
    return versionsMap
}

module.exports = {
    DEFAULT_VERSION_TEXT,
    VERSION_IN_USE_SYMBOL,
    VERSION_INSTALLED_SYMBOL,
    getRcFileVersion,
    getSplitVersionAndArgs,
    getDefaultVersion,
    getVersionInUse,
    getYarnVersions,
    setDefaultVersion,
    isValidVersionString,
    getValidVersionString,
    printVersions,
}
