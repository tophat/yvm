const fs = require('fs')

const { printVersions, versionRootPath } = require('../common/utils')

const getYarnVersions = () => {
    const re = /^v(\d+\.)(\d+\.)(\d+)$/
    const validItems = []
    fs.readdirSync(versionRootPath).forEach(file => {
        if (re.test(file)) {
            validItems.push(file)
        }
    })
    return validItems
}

const listVersions = () => {
    if (!fs.existsSync(versionRootPath)) {
        console.log('You have no yarn versions installed.')
        return
    }

    const installedVersions = getYarnVersions()
    if (installedVersions.length) {
        printVersions(installedVersions, 'Installed yarn versions:')
    } else {
        console.log('You have no yarn versions installed.')
    }
}

module.exports = listVersions
