const fs = require('fs-extra')

const { getExtractionPath } = require('../common/utils')

const removeVersion = version => {
    const versionPath = getExtractionPath(version)
    if (!fs.existsSync(versionPath)) {
        console.error(
            `Failed to remove yarn v${version}. Yarn version ${version} not found.`,
        )
        return
    }

    try {
        fs.removeSync(versionPath)
        console.error(`Successfully removed yarn v${version}.`)
    } catch (err) {
        console.error(`Failed to remove yarn v${version}. \n ${err}`)
    }
}

module.exports = removeVersion
