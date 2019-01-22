const path = require('path')
const childProcess = require('child_process')

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
    try {
        // WARNING :: When changing this logic ensure that passing of stdio works correctly. e.g. user input, arrows keys
        // test:
        // `nvm use 4.8.0` (lowest supported node version
        // `make install`
        // `yvm exec contributors:add` and go through the steps
        childProcess.execFileSync(filePath, extraArgs, {
            stdio: 'inherit',
        })
    } catch (error) {
        log(error.message)
        throw new Error('yarn failed, non-zero exit')
    }
}

const execCommand = (version, extraArgs = ['-v'], rootPath = yvmPath) =>
    ensureVersionInstalled(version, rootPath).then(() =>
        runYarn(version, extraArgs, rootPath),
    )

const [, , maybeVersionArg, ...rest] = process.argv
const [version, args] = getSplitVersionAndArgs(maybeVersionArg, ...rest)
execCommand(version, args).catch(err => {
    log(err.message)
    process.exit(1)
})
