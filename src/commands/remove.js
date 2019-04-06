import fs from 'fs-extra'

import { getExtractionPath } from '../util/utils'
import { getVersionInUse, resolveVersion } from '../util/version'
import { yvmPath } from '../util/path'

import log from '../util/log'

export const remove = async (versionString, rootPath = yvmPath) => {
    log.info(`Removing Yarn v${versionString}`)
    try {
        const version = await resolveVersion({
            versionString,
            yvmPath: rootPath,
        })
        const versionPath = getExtractionPath(version, rootPath)
        const versionInUse = await getVersionInUse()

        if (versionInUse && versionPath.includes(versionInUse)) {
            throw new Error('You cannot remove currently-active version')
        }

        if (!fs.existsSync(versionPath)) {
            throw new Error(`Yarn version ${version} not found.`)
        }
        fs.removeSync(versionPath)
        log(`Successfully removed yarn v${version}.`)
        return 0
    } catch (err) {
        log(`Failed to remove yarn v${versionString}.\n${err.message}`)
        return 1
    }
}
