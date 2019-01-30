const fs = require('fs-extra')

const { getExtractionPath } = require('../util/utils')
const { getVersionInUse } = require('../util/version')
const { yvmPath } = require('../util/path')

const log = require('../util/log')

const removeVersion = async (version, rootPath = yvmPath) => {
    const versionPath = getExtractionPath(version, rootPath)
    const versionInUse = await getVersionInUse()

    if (versionInUse && versionPath.includes(versionInUse)) {
        log('You cannot remove currently-active version')
        return 1
    }

    if (!fs.existsSync(versionPath)) {
        log(
            `Failed to remove yarn v${version}. Yarn version ${version} not found.`,
        )
        return 1
    }

    try {
        fs.removeSync(versionPath)
        log(`Successfully removed yarn v${version}.`)
        return 0
    } catch (err) {
        log(`Failed to remove yarn v${version}. \n ${err}`)
        return 1
    }
}

module.exports = removeVersion
