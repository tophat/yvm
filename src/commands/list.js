const fs = require('fs')

const { printVersions, versionRootPath } = require('../common/utils')

const getYarnVersions = () => {
    const re = /^v(\d+\.)(\d+\.)(\d+)$/
    if (fs.existsSync(versionRootPath)) {
        return fs.readdirSync(versionRootPath).filter(file => re.test(file))
    }
    return []
}

const listVersions = () => {
    const installedVersions = getYarnVersions()
    if (installedVersions.length) {
        printVersions(installedVersions, 'Installed yarn versions:')
    } else {
        console.log('You have no yarn versions installed.')
    }
}

module.exports = listVersions
