/* eslint-disable global-require,import/no-dynamic-require */
const fs = require('fs')
const path = require('path')

const { yvmPath } = require('./common/utils')
const { getRcFileVersion, isValidVersionString } = require('./util/version')
const log = require('./common/log')
const installVersion = require('./commands/install')

const getYarnPath = (version, rootPath) =>
    path.resolve(rootPath, `versions/v${version}`)

/* eslint-disable no-undef, camelcase */
const execFile =
    typeof __webpack_require__ === 'function'
        ? __non_webpack_require__
        : require
/* eslint-enable no-undef, camelcase */

const runYarn = (version, extraArgs, rootPath) => {
    // first two arguments are filler args [node version, yarn version]
    process.argv = ['', ''].concat(extraArgs)
    execFile(path.resolve(getYarnPath(version, rootPath), 'bin/yarn.js'))
}

const execCommand = () => {
    const version = getRcFileVersion()
    if (isValidVersionString(version)) {
        log(`Using .yvmrc version: ${version}`)
        const rootPath = yvmPath
        const extraArgs = process.argv.slice(2)
        const yarnBinDir = getYarnPath(version, rootPath)

        if (!fs.existsSync(yarnBinDir)) {
            return installVersion(version, rootPath).then(() =>
                runYarn(version, extraArgs, rootPath),
            )
        }
        return Promise.resolve(runYarn(version, extraArgs, rootPath))
    } else if (version !== null) {
        return Promise.reject(new Error(`Invalid .yvmrc version: ${version}`))
    }
    return Promise.reject(
        new Error(
            `
            No version supplied, no .yvmrc
            Perhaps you wanted to specify your version like?
            yvm exec 1.2.0 list
            `,
        ),
    )
}

if (require.main === module) {
    execCommand().catch(err => {
        log(err)
        process.exit(1)
    })
}
