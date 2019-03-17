const log = require('../util/log')
const { getVersionsFromTags } = require('../util/utils')
const {
    getVersionInUse,
    getYarnVersions,
    printVersions,
} = require('../util/version')

const listRemoteCommand = async () => {
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

module.exports = listRemoteCommand
