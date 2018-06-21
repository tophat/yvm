const fs = require('fs')

const log = require('../common/log')
const { printVersions, versionRootPath, yvmPath } = require('../common/utils')

const getYarnVersions = rootPath => {
    const re = /^v(\d+\.)(\d+\.)(\d+)$/
    if (fs.existsSync(versionRootPath(rootPath))) {
        return fs
            .readdirSync(versionRootPath(rootPath))
            .filter(file => re.test(file))
    }
    return []
}

const listVersions = (rootPath = yvmPath) => {
    const installedVersions = getYarnVersions(rootPath)
    if (installedVersions.length) {
        printVersions(installedVersions, 'Installed yarn versions:')
    } else {
        log('You have no yarn versions installed.')
    }
}

module.exports = listVersions
