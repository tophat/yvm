import log from '../util/log'
import { getVersionsFromTags } from '../util/utils'
import {
    getVersionInUse,
    getYarnVersions,
    printVersions,
} from '../util/version'

export const listRemote = async () => {
    log.info('list-remote')
    try {
        const [remoteVersions, versionInUse, localVersions] = await Promise.all(
            [getVersionsFromTags(), getVersionInUse(), getYarnVersions()],
        )
        if (!remoteVersions.length) {
            throw new Error('No versions available for install')
        }
        await printVersions({
            list: remoteVersions,
            message: 'Versions available for install:',
            versionInUse,
            localVersions,
        })
    } catch (e) {
        log(e.message)
        log.info(e.stack)
        process.exit(1)
    }
}
