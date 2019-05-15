import { getRcFileVersion, getVersionInUse } from 'util/version'
import log from 'util/log'
import { getYarnPathEntries, isYvmPath } from 'util/path'

export const current = async ({ shell } = {}) => {
    const versionInUse = await getVersionInUse()
    if (!versionInUse) {
        log('Sorry, yarn is NOT installed.')
        return 1
    }
    const [maybeYvmYarn] = getYarnPathEntries(shell)
    log.info(`yarn exec: ${maybeYvmYarn}`)
    if (!isYvmPath(maybeYvmYarn)) {
        log('Yarn was NOT installed by yvm')
        return 2
    }
    log(`Currently on yarn version ${versionInUse}`)
    const rcVersion = getRcFileVersion()
    if (rcVersion !== null) {
        if (versionInUse === rcVersion) {
            log('Your .yvmrc version matches your PATH version, good job!')
        } else {
            log(
                `Your .yvmrc version: ${rcVersion} and PATH version: ${versionInUse} don't match :(`,
            )
        }
    }
    return 0
}
