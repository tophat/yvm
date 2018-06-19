const fs = require('fs-extra')

const { getExtractionPath } = require('../common/utils')
const log = require('../common/log')

const removeVersion = version => {
    const versionPath = getExtractionPath(version)
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
