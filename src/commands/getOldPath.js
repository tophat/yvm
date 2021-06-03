import log from 'util/log'
import { getNonYvmPathEntries, toPathString } from 'util/path'

export const buildOldPath = (shell) =>
    toPathString({ shell, paths: [...new Set(getNonYvmPathEntries(shell))] })

export const getOldPath = async (shell) => {
    try {
        log.capturable(buildOldPath(shell))
        return 0
    } catch (e) {
        log.error(e.message)
        log.info(e.stack)
        return 1
    }
}
