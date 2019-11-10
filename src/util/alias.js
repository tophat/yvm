import fs from 'fs'
import { execSync } from 'child_process'
import path from 'path'

import { memoize } from 'lodash'
import chalk from 'chalk'

import log from 'util/log'
import { yvmPath as defaultYvmPath, getNonYvmYarnPathEntries } from 'util/path'
import { getRequest, getVersionsFromTags } from 'util/utils'
import { YARN_STABLE_VERSION_URL } from 'util/constants'

const filterAliasesByName = (pattern, aliases) => {
    return Object.keys(aliases)
        .filter(name => new RegExp(pattern).test(name))
        .map(name => ({ name, value: aliases[name] }))
}

const getAllDependants = ({ name, aliases }) => {
    const visited = []
    const dependants = [name]
    const aliasNames = Object.keys(aliases)
    while (dependants.length) {
        const aliasName = dependants.shift()
        if (visited.includes(aliasName)) {
            continue
        }
        visited.push(aliasName)
        dependants.push(...aliasNames.filter(d => aliases[d] === aliasName))
    }
    return visited
}

export const STORAGE_FILE = '.aliases'

export const DEFAULT = 'default'
export const LATEST = 'latest'
export const LTS = 'lts' // TODO: resolve long term support version
export const STABLE = 'stable'
export const SYSTEM = 'system'
export const UNRESOLVED = undefined
export const NOT_AVAILABLE = 'N/A'
export const DEFAULT_NAMES = [LATEST, STABLE, SYSTEM]
export const RESERVED_NAMES = [...DEFAULT_NAMES, LTS, NOT_AVAILABLE]

export const resolveLatest = memoize(
    async () => (await getVersionsFromTags())[0],
)

export const resolveStable = memoize(async () => {
    const version = await getRequest(YARN_STABLE_VERSION_URL)
    return (version && version.trim()) || UNRESOLVED
})

export const resolveSystem = memoize(async ({ shell } = {}) => {
    for (const pathToExec of getNonYvmYarnPathEntries(shell)) {
        try {
            const execCommand = `${pathToExec} --version 2> /dev/null`
            return String(execSync(execCommand)).trim()
        } catch (error) {
            log.info(error.message)
        }
    }
    return NOT_AVAILABLE
})

export const isReserved = name => RESERVED_NAMES.includes(name)

export const resolveReserved = memoize(async (name, args = {}) => {
    const resolver =
        {
            [LATEST]: resolveLatest,
            [STABLE]: resolveStable,
            [SYSTEM]: resolveSystem,
        }[name] || (async () => NOT_AVAILABLE)
    return resolver(args)
})

export const getDefaultAliases = () => {
    return DEFAULT_NAMES.reduce(
        (aliases, name) => Object.assign(aliases, { [name]: UNRESOLVED }),
        {},
    )
}

export const getUserAliases = memoize(async (yvmPath = defaultYvmPath) => {
    const aliases = { [DEFAULT]: STABLE }
    const aliasStoragePath = path.join(yvmPath, STORAGE_FILE)
    try {
        const aliasesJSON = fs.readFileSync(aliasStoragePath, 'utf8')
        Object.assign(aliases, JSON.parse(aliasesJSON))
    } catch (e) {
        log.info(e.message)
    }
    return aliases
})

export const getMatchingAliases = async (pattern, yvmPath = defaultYvmPath) => {
    return filterAliasesByName(pattern, await getUserAliases(yvmPath))
}

export const setAlias = async ({ name, version, yvmPath = defaultYvmPath }) => {
    const aliasStoragePath = path.join(yvmPath, STORAGE_FILE)
    try {
        if (isReserved(name)) {
            throw new Error(`'${name}' is reserved. Please choose another.`)
        }
        const aliases = await getUserAliases(yvmPath)
        aliases[name] = version
        fs.writeFileSync(aliasStoragePath, JSON.stringify(aliases))
        return true
    } catch (e) {
        log(`Unable to set alias. ${e.message}`)
        log.info(e.stack)
        return false
    }
}

export const unsetAlias = async ({
    name,
    force = false,
    recursive = false,
    yvmPath = defaultYvmPath,
}) => {
    const aliasStoragePath = path.join(yvmPath, STORAGE_FILE)
    try {
        if (isReserved(name)) {
            throw new Error(`'${name}' is reserved by yvm.`)
        }
        let deleted = false
        const aliases = await getUserAliases(yvmPath)
        const aliasNameList = Object.keys(aliases)
        const dependants = aliasNameList.filter(d => aliases[d] === name)
        if (dependants.length && !force && !recursive) {
            log.notice(`The following aliases will be orphaned: ${dependants}
Rerun with '--force' to remove just this alias
Or with '--recursive' to remove all dependants`)
        } else {
            const namesToRemove = recursive
                ? getAllDependants({ name, aliases })
                : [name]
            const newAliases = {}
            for (const aliasName of aliasNameList) {
                if (namesToRemove.includes(aliasName)) continue
                newAliases[aliasName] = aliases[aliasName]
            }
            deleted = aliases[name] !== newAliases[name]
            log.info(`The following aliases were removed: ${namesToRemove}`)
            fs.writeFileSync(aliasStoragePath, JSON.stringify(newAliases))
        }
        if (dependants.length && deleted && !recursive) {
            log.notice(`The following aliases are now orphaned: ${dependants}`)
        }
        return deleted
    } catch (e) {
        log(`Unable to unset ${e.message}`)
        log.info(e.stack)
        return false
    }
}

export const resolveAlias = memoize(
    async ({
        versionString,
        currentAliases,
        visitedAliases = [],
        yvmPath = defaultYvmPath,
    }) => {
        const chain = visitedAliases.join(', ')
        const resolveErrorMessage = msg => `${msg}: '${versionString}' ${chain}`
        if (visitedAliases.includes(versionString)) {
            throw new Error(resolveErrorMessage`Cyclic chain detected`)
        }
        const aliases = currentAliases || (await getUserAliases(yvmPath))
        if (versionString in aliases && !isReserved(versionString)) {
            return await resolveAlias({
                versionString: aliases[versionString],
                currentAliases: aliases,
                visitedAliases: [...visitedAliases, versionString],
                yvmPath,
            })
        }
        return {
            visited: visitedAliases,
            version: versionString,
        }
    },
)

export const resolveAliases = memoize(async (yvmPath = defaultYvmPath) => {
    const currentAliases = {
        ...(await getUserAliases(yvmPath)),
        ...getDefaultAliases(),
    }
    const resolvedAliases = {}
    for (const versionString of Object.keys(currentAliases)) {
        if (versionString in resolvedAliases) {
            continue
        }
        const { version, visited } = await resolveAlias({
            versionString,
            currentAliases,
            yvmPath,
        }).catch(() => ({ version: undefined, visited: [] }))
        for (const alias of [versionString, ...visited]) {
            resolvedAliases[alias] = {
                value: currentAliases[alias],
                version,
            }
        }
    }
    return resolvedAliases
})

export const resolveMatchingAliases = memoize(
    async (pattern = '', yvmPath = defaultYvmPath) => {
        return filterAliasesByName(pattern, await resolveAliases(yvmPath))
    },
)

export const getFormatter = (
    allVersions,
    installedVersions,
    currentVersion,
) => (name, version, target) => {
    const defaultStyler = chalk.grey
    let termStyler = defaultStyler
    const isAvailable = allVersions.includes(target)
    if (target === currentVersion) {
        termStyler = chalk.green
    } else if (installedVersions.includes(target)) {
        termStyler = chalk.yellow
    } else if (isAvailable) {
        termStyler = chalk.white
    } else {
        termStyler = chalk.red
    }
    if (isReserved(name)) {
        termStyler = termStyler.bold
    }
    const parts = [termStyler(name), ' → ']
    const targetVersion = termStyler(isAvailable ? target : NOT_AVAILABLE)
    if (version) {
        parts.push(chalk.white(version), ' (', targetVersion, ')')
    } else {
        parts.push(targetVersion)
    }

    return defaultStyler(parts.join(''))
}
