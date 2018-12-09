const fs = require('fs')

const { getActiveVersion } = require('../util/version')
const log = require('../util/log')
const {
    printVersions,
    stripVersionPrefix,
    versionRootPath,
    yvmPath,
} = require('../util/utils')

const getYarnVersions = rootPath => {
    const re = /^v(\d+\.)(\d+\.)(\d+)$/
    if (fs.existsSync(versionRootPath(rootPath))) {
        return fs
            .readdirSync(versionRootPath(rootPath))
            .filter(file => re.test(file))
            .map(stripVersionPrefix)
    }
    return []
}

const listVersions = (rootPath = yvmPath) => {
    const installedVersions = getYarnVersions(rootPath)
    if (installedVersions.length) {
        const message = 'Installed yarn versions:'
        getActiveVersion()
            .catch(() => printVersions(installedVersions, message))
            .then(activeVersion =>
                printVersions(installedVersions, message, activeVersion),
            )
    } else {
        log('You have no yarn versions installed.')
    }
}

module.exports = listVersions
