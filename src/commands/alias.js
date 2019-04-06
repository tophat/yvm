import log from '../util/log'
import { getFormatter, resolveMatchingAliases, setAlias } from '../util/alias'
import {
    getVersionInUse,
    getYarnVersions,
    resolveVersion,
} from '../util/version'
import { getVersionsFromTags } from '../util/utils'

const safeResolveVersion = async versionString =>
    resolveVersion({ versionString }).catch(e => log.info(e.message))

const setAliasCommand = async ({ name, version }) => {
    const [allVersions, installedVersions, currentVersion] = await Promise.all([
        getVersionsFromTags(),
        getYarnVersions(),
        getVersionInUse(),
    ])
    const format = getFormatter(allVersions, installedVersions, currentVersion)
    let targetVersion
    if (await setAlias({ name, version })) {
        targetVersion = await safeResolveVersion(version)
    }
    const message = format(name, version, targetVersion)
    if (targetVersion) {
        log(message)
        return 0
    } else {
        log.error(message)
        return 1
    }
}

const getAliasCommand = async ({ pattern }) => {
    const [
        allVersions,
        installedVersions,
        currentVersion,
        matchingAliases,
    ] = await Promise.all([
        getVersionsFromTags(),
        getYarnVersions(),
        getVersionInUse(),
        resolveMatchingAliases(pattern),
    ])
    const format = getFormatter(allVersions, installedVersions, currentVersion)
    for (const {
        name,
        value: { value, version: versionString },
    } of matchingAliases) {
        const version = await safeResolveVersion(versionString)
        log(format(name, value, version))
    }
    const noMatchFound = pattern.length > 0 && matchingAliases.length < 1
    return noMatchFound ? 1 : 0
}

export const alias = async (nameOrPattern, maybeVersion) => {
    try {
        if (typeof maybeVersion === 'string') {
            const name = nameOrPattern
            const version = maybeVersion
            return await setAliasCommand({ name, version })
        } else {
            const pattern = nameOrPattern || ''
            return await getAliasCommand({ pattern })
        }
    } catch (e) {
        log.error(e.message)
        return 2
    }
}
