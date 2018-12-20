const log = require('../util/log')
const { getVersionsFromTags } = require('../util/utils')
const { printVersions, getVersionInUse } = require('../util/version')

const listRemoteCommand = () => {
    log.info('list-remote')

    return Promise.all([getVersionsFromTags(), getVersionInUse()])
        .then(results => {
            const [remoteVersions, versionInUse] = results
            printVersions({
                list: remoteVersions,
                message: 'Versions available for install:',
                versionInUse,
            })
        })
        .catch(error => log(error))
}

module.exports = listRemoteCommand
