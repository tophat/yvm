const log = require('../util/log')
const { getVersionsFromTags } = require('../util/utils')
const { printVersions } = require('../util/version')

const listRemoteCommand = () => {
    log.info('list-remote')

    return getVersionsFromTags()
        .then(versions => {
            printVersions({
                list: versions,
                message: 'Versions available for install:',
            })
        })
        .catch(error => {
            log(error)
        })
}

module.exports = listRemoteCommand
