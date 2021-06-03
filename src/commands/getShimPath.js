import log from 'util/log'
import { shimRootPath } from 'util/utils'
import { getNonYvmShimPathEntries, toPathString, yvmPath } from 'util/path'

export const buildShimPath = (shell) => {
    const updatedPath = [
        shimRootPath(yvmPath),
        ...new Set(getNonYvmShimPathEntries(shell)),
    ]
    return toPathString({ shell, paths: updatedPath })
}

export const getShimPath = async (shell) => {
    try {
        log.capturable(buildShimPath(shell))
        return 0
    } catch (e) {
        log.error(e.message)
        log.info(e.stack)
        return 1
    }
}
