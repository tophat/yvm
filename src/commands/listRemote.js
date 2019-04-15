import log from 'util/log'
import { getVersionsFromTags } from 'util/utils'
import { getVersionInUse, getYarnVersions, printVersions } from 'util/version'

export const listRemote = async () => {
    log.info('Checking for available yarn versions...')
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
        return 0
    } catch (e) {
        log(e.message)
        log.info(e.stack)
        return 1
    }
}
