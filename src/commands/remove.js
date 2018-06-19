const fs = require('fs-extra')

const { getExtractionPath } = require('../common/utils')

const removeVersion = version => {
    const versionPath = getExtractionPath(version)
    if (!fs.existsSync(versionPath)) {
        console.log(
            `Failed to remove yarn v${version}. Yarn version ${version} not found.`,
        )
        return
    }

    try {
        fs.removeSync(versionPath)
        console.log(`Successfully removed yarn v${version}.`)
    } catch (err) {
        console.log(`Failed to remove yarn v${version}. \n ${err}`)
    }
}

module.exports = removeVersion
