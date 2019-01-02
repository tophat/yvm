const log = require('../util/log')
const {
    getVersionInUse,
    getYarnVersions,
    printVersions,
} = require('../util/version')

const listVersions = rootPath => {
    const installedVersions = getYarnVersions(rootPath)
    if (installedVersions.length) {
        getVersionInUse().then(versionInUse => {
            const message = 'Installed yarn versions:'
            printVersions({
                list: installedVersions,
                message,
                versionInUse,
            })
        })
    } else {
        log('You have no yarn versions installed.')
    }
    return installedVersions
}

module.exports = listVersions
