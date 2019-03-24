import log from '../util/log'
import {
    getVersionInUse,
    getYarnVersions,
    printVersions,
} from '../util/version'

export const listVersions = async rootPath => {
    const installedVersions = getYarnVersions(rootPath)
    if (installedVersions.length) {
        const versionInUse = await getVersionInUse()
        const message = 'Installed yarn versions:'
        await printVersions({
            list: installedVersions,
            message,
            versionInUse,
        })
    } else {
        log('You have no yarn versions installed.')
    }
    return installedVersions
}
