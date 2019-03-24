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
        await printVersions({
            list: remoteVersions,
            message: 'Versions available for install:',
            versionInUse,
            localVersions,
        })
    } catch (e) {
        log.error(e)
    }
}
