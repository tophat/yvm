const fs = require('fs')
const path = require('path')
const semver = require('semver')
const { execSync } = require('child_process')
const cosmiconfig = require('cosmiconfig')

const log = require('./log')
const { yvmPath: defaultYvmPath } = require('./path')
const {
    getVersionsFromTags,
    stripVersionPrefix,
    versionRootPath,
} = require('./utils')

const DEFAULT_VERSION_TEXT = 'Global Default'
const VERSION_IN_USE_SYMBOL = '\u2713'
const VERSION_INSTALLED_SYMBOL = '\u2192'

function isValidVersionString(version) {
    return semver.valid(version.trim()) !== null
}

function isValidVersionRange(versionRange) {
    return semver.validRange(versionRange.trim()) !== null
}

function getValidVersionString(version) {
    return semver.clean(version)
}

async function getVersionFromRange(versionRange) {
    return (
        semver.maxSatisfying(getYarnVersions(), versionRange) ||
        semver.maxSatisfying(await getVersionsFromTags(), versionRange)
    )
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
    const moduleName = 'yvm'
    const explorer = cosmiconfig(moduleName, {
        packageProp: 'engines.yarn',
        searchPlaces: [
            'package.json',
            `.${moduleName}rc`,
            `.${moduleName}rc.json`,
            `.${moduleName}rc.yaml`,
            `.${moduleName}rc.yml`,
            `.${moduleName}rc.js`,
            `${moduleName}.config.js`,
            `.yarnversion`,
        ],
    })
    const result = explorer.searchSync()
    if (!result || result.isEmpty || !result.config) {
        return null
    }
    log.info(`Found config ${result.filepath}`)
    return String(result.config)
}

async function getVersionInUse() {
    try {
        return String(execSync('yarn --version')).trim()
    } catch (error) {
        log.info(error)
        return ''
    }
}

function getYarnVersions(yvmPath = defaultYvmPath) {
    const versionsPath = versionRootPath(yvmPath)
    if (fs.existsSync(versionsPath)) {
        const files = fs.readdirSync(versionsPath)
        return files
            .filter(name => name.startsWith('v') && isValidVersionString(name))
            .map(stripVersionPrefix)
    }
    return []
}

// eslint-disable-next-line consistent-return
const getSplitVersionAndArgs = async (maybeVersionArg, ...rest) => {
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
            const validVersion = isValidVersionString(rcVersion)
            const validVersionRange = isValidVersionRange(rcVersion)
            if (!validVersion && !validVersionRange) {
                throw new Error(
                    `Invalid yarn version found in config: ${rcVersion}`,
                )
            }
            versionToUse = validVersion
                ? getValidVersionString(rcVersion)
                : await getVersionFromRange(rcVersion)
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
        log.error(e.message)
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

        if (isCurrent) log.success(toLog)
        else if (isInstalled) log.notice(toLog)
        else log(toLog)

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
    getValidVersionString,
    getVersionFromRange,
    getVersionInUse,
    getYarnVersions,
    isValidVersionRange,
    isValidVersionString,
    printVersions,
    setDefaultVersion,
}
