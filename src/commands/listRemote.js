const log = require('../util/log')
const { getVersionsFromTags, printVersions } = require('../util/utils')

const listRemoteCommand = () => {
    log('list-remote')

    return getVersionsFromTags()
        .then(versions => {
            printVersions(versions, 'Versions available for install:')
        })
        .catch(error => {
            log(error)
        })
}

module.exports = listRemoteCommand
