const fs = require('fs')

const { versionRootPath } = require('../common/utils')

const getYarnVersions = () => {
    const re = /^v(\d+\.)(\d+\.)(\d+)/
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
        console.log('Installed yarn versions:')
        installedVersions.forEach(item => {
            console.log(`  - ${item}`)
        })
    } else {
        console.log('You have no yarn versions installed.')
    }
}

module.exports = listVersions
