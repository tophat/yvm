const os = require('os')
const path = require('path')

const yvmPath = path.resolve(os.homedir(), '.yvm')
const versionRootPath = path.resolve(yvmPath, 'versions')

const getExtractionPath = version =>
    path.resolve(versionRootPath, `v${version}`)

const stripVersionPrefix = tagName => {
    if (tagName[0] === 'v') {
        return tagName.substring(1)
    }
    return tagName
}

module.exports = {
    getExtractionPath,
    stripVersionPrefix,
    versionRootPath,
}
