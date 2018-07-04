/* eslint-disable global-require,import/no-dynamic-require */
const fs = require('fs')
const path = require('path')

const { yvmPath } = require('./common/utils')
const {
    getRcFileVersion,
    isValidVersionString,
    validateVersionString,
} = require('./util/version')
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
    log(`yarn ${extraArgs.join(' ')}`)
    execFile(path.resolve(getYarnPath(version, rootPath), 'bin/yarn.js'))
}

const execCommand = (version, extraArgs = ['-v'], rootPath = yvmPath) =>
    new Promise(resolve => {
        validateVersionString(version)
        log(`Using yarn version: ${version}`)
        const yarnBinDir = getYarnPath(version, rootPath)

        if (!fs.existsSync(yarnBinDir)) {
            return resolve(
                installVersion(version, rootPath).then(() =>
                    runYarn(version, extraArgs, rootPath),
                ),
            )
        }

        return resolve(runYarn(version, extraArgs, rootPath))
    })

if (require.main === module) {
    const [, , maybeVersionArg, maybeCommand, ...rest] = process.argv
    const versionArgValid = isValidVersionString(maybeVersionArg)
    const rcVersion = getRcFileVersion()
    const version = versionArgValid ? maybeVersionArg : rcVersion
    const command = versionArgValid ? maybeCommand : maybeVersionArg
    if (command === maybeVersionArg && maybeCommand !== undefined) {
        rest.unshift(maybeCommand)
    }
    execCommand(version, [command, ...rest]).catch(err => {
        log(err.message)
        process.exit(1)
    })
}

module.exports = execCommand
