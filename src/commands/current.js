import semver from 'semver'

import log from 'util/log'
import { getYarnPathEntries, isYvmPath } from 'util/path'
import { NOT_AVAILABLE, SYSTEM } from 'util/alias'
import { getRcFileVersion, getVersionInUse } from 'util/version'

export const current = async ({ shell } = {}) => {
    const versionInUse = await getVersionInUse()
    const [maybeYvmYarn] = getYarnPathEntries(shell)
    log.info(`yarn: ${maybeYvmYarn || 'none'}`)
    const isYvmYarn = isYvmPath(maybeYvmYarn)
    const yarnVersion = isYvmYarn ? versionInUse : SYSTEM
    log.capturable(yarnVersion || NOT_AVAILABLE)

    if (!versionInUse) {
        log('Sorry, yarn is NOT installed.')
        return 1
    }
    if (!isYvmYarn) {
        log('Yarn was NOT installed by yvm')
        return 2
    }
    const rcVersion = getRcFileVersion()
    if (rcVersion !== null) {
        if (semver.satisfies(versionInUse, rcVersion)) {
            log('Your .yvmrc version matches your PATH version, good job!')
        } else {
            log(
                `Your .yvmrc version: ${rcVersion} and PATH version: ${versionInUse} don't match :(`,
            )
        }
    }
    return 0
}
