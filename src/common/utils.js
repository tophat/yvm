const os = require('os')
const path = require('path')

const log = require('../common/log')

const yvmPath = path.resolve(os.homedir(), '.yvm')
const versionRootPath = path.resolve(yvmPath, 'versions')

const getExtractionPath = version =>
    path.resolve(versionRootPath, `v${version}`)

const stripVersionPrefix = tagName =>
    tagName[0] === 'v' ? tagName.substring(1) : tagName

const printVersions = (list, message) => {
    log(message)
    list.forEach(item => {
        log(`  - ${item}`)
    })
}

module.exports = {
    getExtractionPath,
    printVersions,
    stripVersionPrefix,
    versionRootPath,
}
