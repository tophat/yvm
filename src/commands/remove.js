import fs from 'fs-extra'

import { getExtractionPath } from '../util/utils'
import { getVersionInUse, resolveVersion } from '../util/version'
import { yvmPath } from '../util/path'

import log from '../util/log'

export const remove = async (versionString, rootPath = yvmPath) => {
    const version = await resolveVersion({ versionString, yvmPath: rootPath })
    const versionPath = getExtractionPath(version, rootPath)
    const versionInUse = await getVersionInUse()

    if (versionInUse && versionPath.includes(versionInUse)) {
        log('You cannot remove currently-active version')
        return 1
    }

    if (!fs.existsSync(versionPath)) {
        log(
            `Failed to remove yarn v${version}. Yarn version ${version} not found.`,
        )
        return 1
    }

    try {
        fs.removeSync(versionPath)
        log(`Successfully removed yarn v${version}.`)
        return 0
    } catch (err) {
        log(`Failed to remove yarn v${version}. \n ${err}`)
        return 1
    }
}
