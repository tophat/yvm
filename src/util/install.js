const fs = require('fs')

const { getExtractionPath } = require('../util/utils')
const { yvmPath } = require('../util/path')

const { installVersion } = require('../commands/install')

const ensureVersionInstalled = (version, rootPath = yvmPath) => {
    const yarnBinDir = getExtractionPath(version, rootPath)
    if (fs.existsSync(yarnBinDir)) {
        return Promise.resolve()
    }
    return installVersion(version, rootPath)
}

module.exports = {
    ensureVersionInstalled,
}
