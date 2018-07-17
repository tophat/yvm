const { getVersionsFromTags, printVersions } = require('../common/utils')
const { log } = require('../common/log')

const listRemoteCommand = () => {
    log.info('list-remote')

    return getVersionsFromTags()
        .then(versions => {
            printVersions(versions, 'Versions available for install:')
        })
        .catch(error => {
            log(error)
        })
}

module.exports = listRemoteCommand
