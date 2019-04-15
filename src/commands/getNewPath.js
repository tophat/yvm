import path from 'path'

import log from 'util/log'
import { versionRootPath } from 'util/utils'
import { getPathDelimiter, getPathEntries, yvmPath } from 'util/path'
import { getSplitVersionAndArgs } from 'util/version'
import { ensureVersionInstalled } from 'commands/install'

export const buildNewPath = ({ version, rootPath = yvmPath, shell }) => {
    const pathDelimiter = getPathDelimiter(shell)
    const destPath = versionRootPath(rootPath)
    const newPathSegment = path.resolve(destPath, `v${version}`, 'bin')
    const isNotYvmYarnPath = pathSegment => !pathSegment.startsWith(destPath)
    const nonYvmPathEntries = getPathEntries(shell).filter(isNotYvmYarnPath)
    const updatedPath = [newPathSegment, ...new Set(nonYvmPathEntries)]
    return updatedPath.join(pathDelimiter).trim()
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
