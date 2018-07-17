const fs = require('fs-extra')
const shell = require('shelljs')

const { getExtractionPath, yvmPath } = require('../common/utils')
const log = require('../common/log')

const removeVersion = (version, rootPath = yvmPath) => {
    const versionPath = getExtractionPath(version, rootPath)
    const { stdout, stderr, code } = shell.which('yarn')

    if (code !== 0) {
        log(stderr)
        return 2
    }

    if (stdout.startsWith(versionPath)) {
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
