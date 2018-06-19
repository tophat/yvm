const argParser = require('commander')

const { getRcFileVersion, isValidVersionString } = require('./util/version')

const withRcFileVersion = action => (maybeVersionArg, ...rest) => {
    if (maybeVersionArg) {
        if (isValidVersionString(maybeVersionArg)) {
            console.error(`Using provided version: ${maybeVersionArg}`)
            action(maybeVersionArg, ...rest)
            return
        }
        rest.unshift(maybeVersionArg)
    }

    const version = getRcFileVersion()
    if (isValidVersionString(version)) {
        console.error(`Using .yvmrc version: ${version}`)
        action(version, ...rest)
    } else {
        console.error(`Invalid .yvmrc version: ${version}`)
        process.exit(1)
    }
}

module.exports = function dispatch(args) {
    /* eslint-disable global-require,prettier/prettier */
    argParser
        .command('install [version]')
        .action(withRcFileVersion(version => {
            console.error(`Installing yarn v${version}`)
            const install = require('./commands/install')
            install(version)
        }))

    argParser
        .command('remove <version>')
        .action(version => {
            console.error(`Removing yarn v${version}`)
            const remove = require('./commands/remove')
            remove(version)
        })

    argParser
        .command('exec [version] [extraArgs...]')
        .action(withRcFileVersion((version, extraArgs) => {
            console.error(`Executing yarn command with version ${version}`)
            const exec = require('./commands/exec')
            exec(version, extraArgs)
        }))

    argParser
        .command('list')
        .action(() => {
            console.error(`Checking for installed yarn versions...`)
            const listVersions = require('./commands/list')
            listVersions()
        })
    /* eslint-enable global-require,prettier/prettier */
    argParser.parse(args)
}
