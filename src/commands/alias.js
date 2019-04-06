import log from '../util/log'
import { getFormatter, resolveMatchingAliases, setAlias } from '../util/alias'
import {
    getVersionInUse,
    getYarnVersions,
    resolveVersion,
} from '../util/version'
import { getVersionsFromTags } from '../util/utils'

export const alias = async (nameOrPattern, maybeVersion) => {
    try {
        const format = getFormatter(
            await getVersionsFromTags(),
            getYarnVersions(),
            await getVersionInUse(),
        )

        const safeResolveVersion = async versionString =>
            resolveVersion({ versionString }).catch(e => log.info(e.message))

        if (typeof maybeVersion === 'string') {
            const name = nameOrPattern
            const version = maybeVersion
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
        } else {
            const pattern = nameOrPattern || ''
            const matchingAliases = await resolveMatchingAliases(pattern)
            for (const {
                name,
                value: { value, version: versionString },
            } of matchingAliases) {
                const version = await safeResolveVersion(versionString)
                log(format(name, value, version))
            }
            const noMatchFound =
                pattern.length > 0 && matchingAliases.length < 1
            return noMatchFound ? 1 : 0
        }
    } catch (e) {
        log.error(e.message)
        return 2
    }
}
