const os = require('os')
const path = require('path')

const yvmPath = path.resolve(os.homedir(), '.yvm')
const versionRootPath = path.resolve(yvmPath, 'versions')

const getExtractionPath = version =>
    path.resolve(versionRootPath, `v${version}`)

const printVersions = (list, message) => {
    console.log(message)
    list.forEach(item => {
        console.log(`  - ${item}`)
    })
}

module.exports = {
    getExtractionPath,
    printVersions,
    versionRootPath,
}
