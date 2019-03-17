const log = require('../util/log')
const {
    getVersionInUse,
    getYarnVersions,
    printVersions,
} = require('../util/version')

const listVersions = async rootPath => {
    const installedVersions = getYarnVersions(rootPath)
    if (installedVersions.length) {
        const versionInUse = await getVersionInUse()
        const message = 'Installed yarn versions:'
        await printVersions({
            list: installedVersions,
            message,
            versionInUse,
        })
    } else {
        log('You have no yarn versions installed.')
    }
    return installedVersions
}

module.exports = listVersions
