const fs = require('fs')
const { execSync } = require('child_process')
const path = require('path')
const memoize = require('lodash.memoize')

const log = require('./log')
const { getPathEntries, yvmPath: defaultYvmPath } = require('./path')

const { getRequest, getVersionsFromTags } = require('./utils')

const STORAGE_FILE = '.aliases'

const DEFAULT = 'default'
const LATEST = 'latest'
const LTS = 'lts' // TODO: resolve long term support version
const STABLE = 'stable'
const SYSTEM = 'system'
const UNRESOLVED = undefined
const NOT_AVAILABLE = 'N/A'
const DEFAULT_NAMES = [LATEST, STABLE, SYSTEM]
const RESERVED_NAMES = [...DEFAULT_NAMES, LTS, NOT_AVAILABLE]

const resolveLatest = memoize(async () => (await getVersionsFromTags())[0])

const resolveStable = memoize(async () => {
    const body = await getRequest('https://yarnpkg.com/lang/en/docs/install/')
    const matches = body.match(/stable \(([\w.-]+)\)/i)
    return matches ? matches[1] : UNRESOLVED
})

const resolveSystem = memoize(
    async ({ shell, yvmPath = defaultYvmPath } = {}) => {
        for (const pathEntry of getPathEntries(shell)) {
            if (
                pathEntry === '' ||
                pathEntry === '.' ||
                pathEntry.includes(yvmPath)
            ) {
                continue
            }
            try {
                const pathToExec = path.join(pathEntry, 'yarn')
                return String(
                    execSync(`${pathToExec} --version 2> /dev/null`),
                ).trim()
            } catch (error) {
                log.info(error.message)
            }
        }
        return NOT_AVAILABLE
    },
)

const isReserved = name => RESERVED_NAMES.includes(name)

const resolveReserved = memoize(async (name, args = {}) => {
    const resolver =
        {
            [LATEST]: resolveLatest,
            [STABLE]: resolveStable,
            [SYSTEM]: resolveSystem,
        }[name] || (async () => NOT_AVAILABLE)
    return resolver(args)
})

const getDefaultAliases = () => {
    return DEFAULT_NAMES.reduce(
        (aliases, name) => Object.assign(aliases, { [name]: UNRESOLVED }),
        {},
    )
}

const getUserAliases = memoize(async (yvmPath = defaultYvmPath) => {
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

const filterAliasesByName = (pattern, aliases) => {
    return Object.keys(aliases)
        .filter(name => new RegExp(pattern).test(name))
        .map(name => ({ name, value: aliases[name] }))
}

const getMatchingAliases = async (pattern, yvmPath = defaultYvmPath) => {
    return filterAliasesByName(pattern, await getUserAliases(yvmPath))
}

const setAlias = async ({ name, version, yvmPath = defaultYvmPath }) => {
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

const unsetAlias = async ({
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
        const aliasNames = Object.keys(aliases)
        const dependants = aliasNames.filter(d => aliases[d] === name)
        if (dependants.length && !force && !recursive) {
            log.notice(`The following aliases will be orphaned: ${dependants}
Rerun with '--force' to remove just this alias
Or with '--recursive' to remove all dependants`)
        } else {
            const namesToRemove = recursive
                ? getAllDependants({ name, aliases })
                : [name]
            const newAliases = {}
            for (const a of aliasNames) {
                if (namesToRemove.includes(a)) continue
                newAliases[a] = aliases[a]
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

const resolveAlias = memoize(
    async ({
        versionString,
        currentAliases,
        visitedAliases = [],
        yvmPath = defaultYvmPath,
    }) => {
        const chain = visitedAliases.length ? visitedAliases.join(', ') : ''
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

const resolveAliases = memoize(async (yvmPath = defaultYvmPath) => {
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

const resolveMatchingAliases = memoize(
    async (pattern = '', yvmPath = defaultYvmPath) => {
        return filterAliasesByName(pattern, await resolveAliases(yvmPath))
    },
)

module.exports = {
    DEFAULT,
    LATEST,
    NOT_AVAILABLE,
    RESERVED_NAMES,
    STABLE,
    STORAGE_FILE,
    SYSTEM,
    UNRESOLVED,
    getDefaultAliases,
    getMatchingAliases,
    getUserAliases,
    isReserved,
    resolveAlias,
    resolveAliases,
    resolveLatest,
    resolveMatchingAliases,
    resolveReserved,
    resolveStable,
    resolveSystem,
    setAlias,
    unsetAlias,
}
