const fs = require('fs-extra')
const os = require('os')
const path = require('path')

const yvmPath = path.resolve(os.homedir(), '.yvm')
const versionRootPath = path.resolve(yvmPath, 'versions')

const getYarnPath = version => path.resolve(versionRootPath, `v${version}`)

const removeVersion = version => {
    const versionPath = getYarnPath(version)
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
