/* eslint-disable global-require,import/no-dynamic-require */
const path = require('path')
const { exec } = require('shelljs')

const { ensureVersionInstalled } = require('./util/install')
const { getSplitVersionAndArgs } = require('./util/version')
const log = require('./util/log')
const { yvmPath } = require('./util/utils')

const getYarnPath = (version, rootPath) =>
    path.resolve(rootPath, `versions/v${version}`)

const runYarn = (version, extraArgs, rootPath) => {
    // first two arguments are filler args [node version, yarn version]
    process.argv = ['', ''].concat(extraArgs)
    log.info(`yarn ${extraArgs.join(' ')}`)
    const filePath = path.resolve(getYarnPath(version, rootPath), 'bin/yarn.js')
    const runTime = exec(
        filePath
    )
    if (runTime.code !== 0) {
        throw new Error('yarn failed, non-zero exit')
    }
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
