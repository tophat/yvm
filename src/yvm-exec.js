/* eslint-disable global-require,import/no-dynamic-require */
const path = require('path')

const { ensureVersionInstalled } = require('./util/install')
const { getSplitVersionAndArgs } = require('./util/version')
const log = require('./util/log')
const { yvmPath } = require('./util/utils')

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
    log.info(`yarn ${extraArgs.join(' ')}`)
    execFile(path.resolve(getYarnPath(version, rootPath), 'bin/yarn.js'))
}

const execCommand = (version, extraArgs = ['-v'], rootPath = yvmPath) =>
    ensureVersionInstalled(version, rootPath).then(() =>
        runYarn(version, extraArgs, rootPath),
    )

if (require.main === module) {
    const [, , maybeVersionArg, ...rest] = process.argv
    const [version, args] = getSplitVersionAndArgs(maybeVersionArg, ...rest)
    execCommand(version, args).catch(err => {
        log(err.message)
        process.exit(1)
    })
}

module.exports = execCommand
