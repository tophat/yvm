const fs = require('fs')

const { printVersions, versionRootPath } = require('../common/utils')

const getYarnVersions = () => {
    const re = /^v(\d+\.)(\d+\.)(\d+)$/
    const validItems = []

    if (!fs.existsSync(versionRootPath)) {
        return validItems
    }

    fs.readdirSync(versionRootPath).forEach(file => {
        if (re.test(file)) {
            validItems.push(file)
        }
    })

    return validItems
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
