const log = require('../util/log')
const { getVersionsFromTags, printVersions } = require('../util/utils')

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
