const fs = require('fs')
const semver = require('semver')
const { execSync } = require('child_process')
const cosmiconfig = require('cosmiconfig')
const memoize = require('lodash.memoize')

const log = require('./log')
const { yvmPath: defaultYvmPath } = require('./path')
const {
    getVersionsFromTags,
    stripVersionPrefix,
    versionRootPath,
} = require('./utils')
const alias = require('./alias')

const DEFAULT_VERSION_TEXT = 'Global Default'
const VERSION_IN_USE_SYMBOL = '\u2713'
const VERSION_INSTALLED_SYMBOL = '\u2192'

const isValidVersionString = version => semver.valid(version.trim()) !== null
const isValidVersionRange = versionRange => {
    return semver.validRange(versionRange.trim()) !== null
}
const getValidVersionString = version => semver.clean(version)

/**
 * Get the most recent yarn install version in the specified range
 * @param {String} versionRange the bounding yarn version range
 * @throws if no install version can be found for range
 */
const getVersionFromRange = memoize(async versionRange => {
    const availableVersion =
        semver.maxSatisfying(getYarnVersions(), versionRange) ||
        semver.maxSatisfying(await getVersionsFromTags(), versionRange)
    if (!availableVersion) {
        throw new Error(
            `Given version can not be satisfied by yarn: ${versionRange}
See list of available yarn versions using: 'yvm list-remote'`,
        )
    }
    return availableVersion
})

const resolveVersion = memoize(
    async ({ versionString, yvmPath = defaultYvmPath }) => {
        const { version } = await alias.resolveAlias({ versionString, yvmPath })
        if (version) {
            const validVersion = isValidVersionString(version)
            const validVersionRange = isValidVersionRange(version)
            if (validVersion || validVersionRange) {
                return await getVersionFromRange(version)
            }
            if (alias.isReserved(version)) {
                return await alias.resolveReserved(version, { yvmPath })
            }
        }
        throw new Error(`Unable to resolve: ${versionString}`)
    },
)

const getDefaultVersion = async (yvmPath = defaultYvmPath) => {
    try {
        return await resolveVersion({
            versionString: alias.DEFAULT,
            yvmPath,
        })
    } catch (e) {
        log.info(e)
    }
}

const setDefaultVersion = async ({ version, yvmPath = defaultYvmPath }) => {
    try {
        await alias.setAlias({ name: alias.DEFAULT, version, yvmPath })
        return true
    } catch (e) {
        log('Unable to set default version')
        log.info(e)
        return false
    }
}

const getRcFileVersion = () => {
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

const getVersionInUse = memoize(async () => {
    try {
        return String(execSync('yarn --version')).trim()
    } catch (error) {
        log.info(error)
        return ''
    }
})

const getYarnVersions = memoize((yvmPath = defaultYvmPath) => {
    const versionsPath = versionRootPath(yvmPath)
    if (fs.existsSync(versionsPath)) {
        const files = fs.readdirSync(versionsPath)
        return files
            .filter(name => name.startsWith('v') && isValidVersionString(name))
            .map(stripVersionPrefix)
    }
    return []
})

const getSplitVersionAndArgs = async (maybeVersionArg, ...rest) => {
    try {
        if (maybeVersionArg) {
            log.info(`Attempting to resolve ${maybeVersionArg}.`)
            const parsedVersionString = await resolveVersion({
                versionString: maybeVersionArg,
            }).catch(e => {
                log.info(e.message)
                log.info(e.stack)
                return undefined
            })
            if (parsedVersionString) {
                log.info(`Using provided version: ${parsedVersionString}`)
                return [parsedVersionString, rest]
            }
        }

        rest.unshift(maybeVersionArg)
        const rcVersion = getRcFileVersion()
        let versionToUse
        if (rcVersion) {
            log.info(`Resolving version '${rcVersion}' found in config`)
            versionToUse = await resolveVersion({
                versionString: rcVersion,
            })
        } else {
            log.info(`Attempting to use default version.`)
            versionToUse = await getDefaultVersion()
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
        log.info(e.stack)
        process.exit(1)
    }
}

const printVersions = async ({
    list,
    message,
    versionInUse = '',
    defaultVersion,
    localVersions = [],
}) => {
    log(message)

    versionInUse = versionInUse.trim()
    defaultVersion = defaultVersion || (await getDefaultVersion(defaultYvmPath))

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
    getDefaultVersion,
    getRcFileVersion,
    getSplitVersionAndArgs,
    getValidVersionString,
    getVersionFromRange,
    getVersionInUse,
    getYarnVersions,
    isValidVersionRange,
    isValidVersionString,
    printVersions,
    resolveVersion,
    setDefaultVersion,
}
