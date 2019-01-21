const path = require('path')
const { exec } = require('shelljs')

const { ensureVersionInstalled } = require('./commands/install')
const { getSplitVersionAndArgs } = require('./util/version')
const log = require('./util/log')
const { yvmPath } = require('./util/path')

const getYarnPath = (version, rootPath) =>
    path.resolve(rootPath, `versions/v${version}`)

const runYarn = (version, extraArgs, rootPath) => {
    // first two arguments are filler args [node version, yarn version]
    process.argv = ['', ''].concat(extraArgs)
    const filePath = path.resolve(getYarnPath(version, rootPath), 'bin/yarn.js')
    const command = `${filePath} ${extraArgs.join(' ')}`
    log.info(command)
    const runTime = exec(command)
    if (runTime.code !== 0) {
        throw new Error('yarn failed, non-zero exit')
    }
}

const execCommand = (version, extraArgs = ['-v'], rootPath = yvmPath) =>
    ensureVersionInstalled(version, rootPath).then(() =>
        runYarn(version, extraArgs, rootPath),
    )

const [, , maybeVersionArg, ...rest] = process.argv
getSplitVersionAndArgs(maybeVersionArg, ...rest)
    .then(args => execCommand(...args))
    .catch(err => {
        log(err.message)
        process.exit(1)
    })
