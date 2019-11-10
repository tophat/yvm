import fs from 'fs'
import { execSync } from 'child_process'
import log from 'util/log'
import { yvmPath as defaultYvmPath } from 'util/path'
import {
    getVersionsFromTags,
    stripVersionPrefix,
    versionRootPath,
} from 'util/utils'
import {
    DEFAULT,
    isReserved,
    resolveAlias,
    resolveReserved,
    setAlias,
} from 'util/alias'

import { memoize } from 'lodash'
import { cosmiconfigSync } from 'cosmiconfig'
import semver from 'semver'

export const DEFAULT_VERSION_TEXT = 'Global Default'
export const VERSION_IN_USE_SYMBOL = '\u2713'
export const VERSION_INSTALLED_SYMBOL = '\u2192'

export const isValidVersionString = version =>
    semver.valid(version.trim()) !== null
export const isValidVersionRange = versionRange => {
    return semver.validRange(versionRange.trim()) !== null
}
export const getValidVersionString = version => semver.clean(version)

/**
 * Get the most recent yarn install version in the specified range
 * @param {String} versionRange the bounding yarn version range
 * @throws if no install version can be found for range
 */
export const getVersionFromRange = memoize(async versionRange => {
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

export const resolveVersion = memoize(
    async ({ versionString, yvmPath = defaultYvmPath }) => {
        const { version } = await resolveAlias({ versionString, yvmPath })
        if (version) {
            const validVersion = isValidVersionString(version)
            const validVersionRange = isValidVersionRange(version)
            if (validVersion || validVersionRange) {
                return await getVersionFromRange(version)
            }
            if (isReserved(version)) {
                return await resolveReserved(version, { yvmPath })
            }
        }
        throw new Error(`Unable to resolve: ${versionString}`)
    },
)

export const getDefaultVersion = async (yvmPath = defaultYvmPath) => {
    try {
        return await resolveVersion({
            versionString: DEFAULT,
            yvmPath,
        })
    } catch (e) {
        log.info(e)
    }
}

export const setDefaultVersion = async ({
    version,
    yvmPath = defaultYvmPath,
}) => {
    try {
        await setAlias({ name: DEFAULT, version, yvmPath })
        return true
    } catch (e) {
        log('Unable to set default version')
        log.info(e)
        return false
    }
}

export const getRcFileVersion = () => {
    const moduleName = 'yvm'
    const explorer = cosmiconfigSync(moduleName, {
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
    const result = explorer.search()
    if (!result || result.isEmpty || !result.config) {
        return null
    }
    log.info(`Found config ${result.filepath}`)
    return String(result.config)
}

export const getVersionInUse = memoize(async () => {
    try {
        return String(execSync('yarn --version')).trim()
    } catch (error) {
        log.info(error)
        return ''
    }
})

export const getYarnVersions = memoize((yvmPath = defaultYvmPath) => {
    const versionsPath = versionRootPath(yvmPath)
    if (fs.existsSync(versionsPath)) {
        const files = fs.readdirSync(versionsPath)
        return files
            .filter(name => name.startsWith('v') && isValidVersionString(name))
            .map(stripVersionPrefix)
    }
    return []
})

export const getSplitVersionAndArgs = async (maybeVersionArg, ...rest) => {
    let versionToUse
    try {
        if (maybeVersionArg) {
            log.info(`Attempting to resolve ${maybeVersionArg}`)
            const parsedVersionString = await resolveVersion({
                versionString: maybeVersionArg,
            }).catch(e => {
                log.info(e.stack)
            })
            if (parsedVersionString) {
                log.info(`Using provided version: ${parsedVersionString}`)
                return [parsedVersionString, rest]
            }
            rest.unshift(maybeVersionArg)
        }

        const rcVersion = getRcFileVersion()
        if (rcVersion) {
            log.info(`Resolving version '${rcVersion}' found in config`)
            versionToUse = await resolveVersion({
                versionString: rcVersion,
            })
        } else {
            log.info(`Attempting to use default version.`)
            versionToUse = await getDefaultVersion()
        }
    } catch (e) {
        log.error(e.message)
        log.info(e.stack)
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
}

export const printVersions = async ({
    list,
    message,
    versionInUse = '',
    defaultVersion,
    localVersions = [],
}) => {
    log(message)

    versionInUse = versionInUse.trim()
    const versionDefault =
        defaultVersion || (await getDefaultVersion(defaultYvmPath))

    const versionsMap = {}

    list.forEach(versionPadded => {
        const version = versionPadded.trim()
        const isCurrent = version === versionInUse
        const isDefault = version === versionDefault
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
