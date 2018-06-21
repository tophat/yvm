const fs = require('fs-extra')

const { getExtractionPath, yvmPath } = require('../common/utils')
const log = require('../common/log')

const removeVersion = (version, rootPath = yvmPath) => {
    const versionPath = getExtractionPath(version, rootPath)
    if (!fs.existsSync(versionPath)) {
        log(
            `Failed to remove yarn v${version}. Yarn version ${version} not found.`,
        )
        return
    }

    try {
        fs.removeSync(versionPath)
        log(`Successfully removed yarn v${version}.`)
    } catch (err) {
        log(`Failed to remove yarn v${version}. \n ${err}`)
    }
}

module.exports = removeVersion
