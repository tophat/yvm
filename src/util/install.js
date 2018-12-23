const fs = require('fs')

const { getExtractionPath } = require('../util/utils')
const { yvmPath } = require('../util/path')

const { install } = require('../commands/install')

const ensureVersionInstalled = (version, rootPath = yvmPath) => {
    const yarnBinDir = getExtractionPath(version, rootPath)
    if (fs.existsSync(yarnBinDir)) {
        return Promise.resolve()
    }
    return install(version, rootPath)
}

module.exports = {
    ensureVersionInstalled,
}
