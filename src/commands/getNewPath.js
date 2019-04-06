import path from 'path'

import log from '../util/log'
import { versionRootPath } from '../util/utils'
import { getCurrentPath, getPathDelimiter, yvmPath } from '../util/path'
import { getSplitVersionAndArgs } from '../util/version'
import { ensureVersionInstalled } from '../commands/install'

export const buildNewPath = ({
    version,
    rootPath = yvmPath,
    shell,
    pathString,
}) => {
    const pathDelimiter = getPathDelimiter(shell)
    const pathToUpdate = pathString || getCurrentPath(shell) || ''
    const splitPath = pathToUpdate.split(pathDelimiter)
    const destPath = versionRootPath(rootPath)

    const newPathSegment = path.resolve(destPath, `v${version}`, 'bin')
    let hadExistingPath = false

    for (let i = 0; i < splitPath.length; i += 1) {
        const pathSegment = splitPath[i]
        if (pathSegment.startsWith(destPath)) {
            splitPath[i] = newPathSegment
            hadExistingPath = true
            break
        }
    }

    if (!hadExistingPath) {
        splitPath.unshift(newPathSegment)
    }

    return splitPath.join(pathDelimiter).trim()
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
