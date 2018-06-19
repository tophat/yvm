const os = require('os')
const path = require('path')

const yvmPath = path.resolve(os.homedir(), '.yvm')
const versionRootPath = path.resolve(yvmPath, 'versions')

const getExtractionPath = version =>
    path.resolve(versionRootPath, `v${version}`)

const printVersions = (list, message) => {
    console.error(message)
    list.forEach(item => {
        console.error(`  - ${item}`)
    })
}

module.exports = {
    getExtractionPath,
    printVersions,
    versionRootPath,
}
