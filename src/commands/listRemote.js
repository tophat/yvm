const log = require('../util/log')
const { getVersionsFromTags } = require('../util/utils')
const {
    getVersionInUse,
    getYarnVersions,
    printVersions,
} = require('../util/version')

const listRemoteCommand = () => {
    log.info('list-remote')
    return Promise.all([
        getVersionsFromTags(),
        getVersionInUse(),
        getYarnVersions(),
    ])
        .then(results => {
            const [remoteVersions, versionInUse, localVersions] = results
            printVersions({
                list: remoteVersions,
                message: 'Versions available for install:',
                versionInUse,
                localVersions,
            })
        })
        .catch(error => log(error))
}

module.exports = listRemoteCommand
