import path from 'path'

import log from 'util/log'
import { versionRootPath } from 'util/utils'
import { getNonYvmVersionPathEntries, toPathString, yvmPath } from 'util/path'
import { getSplitVersionAndArgs } from 'util/version'
import { ensureVersionInstalled } from 'commands/install'

export const buildNewPath = ({ version, rootPath = yvmPath, shell }) => {
    const updatedPath = [
        path.resolve(versionRootPath(rootPath), `v${version}`, 'bin'),
        ...new Set(getNonYvmVersionPathEntries({ shell, rootPath })),
    ]
    return toPathString({ shell, paths: updatedPath })
}

export const getNewPath = async (maybeVersion, shell) => {
    try {
        const [version] = await getSplitVersionAndArgs(maybeVersion)
        await ensureVersionInstalled(version)
        log.capturable(buildNewPath({ version, shell }))
        return 0
    } catch (e) {
        log.error(e.message)
        log.info(e.stack)
        return 1
    }
}
