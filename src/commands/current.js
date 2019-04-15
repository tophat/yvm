import path from 'path'

import {
    getRcFileVersion,
    getValidVersionString,
    getVersionInUse,
} from 'util/version'
import log from 'util/log'
import { versionRootPath } from 'util/utils'
import { getCurrentPath, getPathDelimiter, yvmPath } from 'util/path'

export const current = async ({ path: pathToUse, shell } = {}) => {
    const pathDelimiter = getPathDelimiter(shell)
    const versionInUse = await getVersionInUse()
    if (!versionInUse) {
        log('Sorry, yarn is NOT installed.')
        return 1
    }
    const envPath = pathToUse || getCurrentPath(shell)
    if (!envPath) {
        log('Environment PATH not found.')
        return 1
    }
    for (const element of envPath.split(pathDelimiter)) {
        if (element.startsWith(versionRootPath(yvmPath))) {
            const [pathVersion] = element
                .split(path.sep)
                .map(getValidVersionString)
                .filter(a => a)
            log.info(`matched yvm version: v${pathVersion} in PATH ${element}`)

            const rcVersion = getRcFileVersion()
            log(`Currently on yarn version ${pathVersion}`)
            if (rcVersion !== null) {
                if (pathVersion === rcVersion) {
                    log(
                        'Your .yvmrc version matches your PATH version, good job!',
                    )
                } else {
                    log(
                        `Your .yvmrc version: ${rcVersion} and PATH version: ${pathVersion} don't match :(`,
                    )
                }
            }
            return 0
        }
    }
    log('Yarn was NOT installed by yvm')
    return 2
}
