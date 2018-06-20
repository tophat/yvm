const argParser = require('commander')

const { getRcFileVersion, isValidVersionString } = require('./util/version')
const log = require('./common/log')

const withRcFileVersion = action => (maybeVersionArg, ...rest) => {
    if (maybeVersionArg) {
        if (isValidVersionString(maybeVersionArg)) {
            log(`Using provided version: ${maybeVersionArg}`)
            action(maybeVersionArg, ...rest)
            return
        }
        rest.unshift(maybeVersionArg)
    }

    const version = getRcFileVersion()
    if (isValidVersionString(version)) {
        log(`Using .yvmrc version: ${version}`)
        action(version, ...rest)
    } else {
        log(`Invalid .yvmrc version: ${version}`)
        process.exit(1)
    }
}

module.exports = function dispatch(args) {
    /* eslint-disable global-require,prettier/prettier */
    argParser
        .command('install [version]')
        .alias('i')
        .action(withRcFileVersion(version => {
            log(`Installing yarn v${version}`)
            const install = require('./commands/install')
            install(version)
        }))

    argParser
        .command('remove <version>')
        .alias('rm')
        .action(version => {
            log(`Removing yarn v${version}`)
            const remove = require('./commands/remove')
            remove(version)
        })

    argParser
        .command('exec [version] [extraArgs...]')
        .action(withRcFileVersion((version, extraArgs) => {
            log(`Executing yarn command with version ${version}`)
            const exec = require('./commands/exec')
            exec(version, extraArgs)
        }))

    argParser
        .command('list-remote')
        .alias('ls-remote')
        .action(() => {
            const listRemote = require('./commands/listRemote')
            listRemote()
        })

    argParser
        .command('list')
        .alias('ls')
        .action(() => {
            log(`Checking for installed yarn versions...`)
            const listVersions = require('./commands/list')
            listVersions()
        })

    /* eslint-enable global-require,prettier/prettier */
    argParser.parse(args)
}
