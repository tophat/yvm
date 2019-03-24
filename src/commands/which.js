import path from 'path'

import log from '../util/log'
import { SYSTEM } from '../util/alias'
import {
    getSplitVersionAndArgs,
    getValidVersionString,
    getVersionInUse,
    getYarnVersions,
} from '../util/version'
import { getVersionsFromTags, versionRootPath } from '../util/utils'
import { yvmPath } from '../util/path'

export const which = async ({ version, rootPath = yvmPath }) => {
    let versionToUse = getValidVersionString(version || '')
    if (!versionToUse) {
        try {
            const [commandVersion] = await getSplitVersionAndArgs(version)
            versionToUse = commandVersion
        } catch (e) {
            log.info(e.message)
        }
    }
    if (!versionToUse) {
        versionToUse = await getVersionInUse()
    }
    if (!versionToUse) {
        log.error('No yarn version supplied!')
        return 1
    }
    if (getYarnVersions().includes(versionToUse)) {
        const destPath = versionRootPath(rootPath)
        log(path.resolve(destPath, `v${versionToUse}`, 'bin', 'yarn'))
        return 0
    }
    const currentVersion = await getVersionInUse()
    if (versionToUse === currentVersion) {
        log(SYSTEM)
        return 0
    }
    const remoteVersions = await getVersionsFromTags()
    if (!remoteVersions.includes(versionToUse)) {
        log.error(`Could not identify yarn version: ${versionToUse}`)
        return 2
    }
    log(`Version '${versionToUse}' is not installed.`)
    return 1
}
