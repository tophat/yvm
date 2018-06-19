/* eslint-disable global-require,prettier/prettier */
const argParser = require('commander')

const { getRcFileVersion, isValidVersionString } = require('./util/version')

const withRcFileVersion = action => (maybeVersionArg, ...rest) => {
    if (maybeVersionArg) {
        if (isValidVersionString(maybeVersionArg)) {
            console.log(`Using provided version: ${maybeVersionArg}`)
            action(maybeVersionArg, ...rest)
            return
        }
        rest.unshift(maybeVersionArg)
    }

    const version = getRcFileVersion()
    if (isValidVersionString(version)) {
        console.log(`Using .yvmrc version: ${version}`)
        action(version, ...rest)
    } else {
        console.warn(`Invalid .yvmrc version: ${version}`)
        process.exit(1)
    }
}

module.exports = function dispatch(args) {
    argParser
        .command('install [version]')
        .action(withRcFileVersion(version => {
            console.log(`Installing yarn v${version}`)
            const install = require('./commands/install')
            install(version)
        }))

    argParser
        .command('remove <version>')
        .action(version => {
            console.log(`Removing yarn v${version}`)
        })

    argParser
        .command('exec [version] [extraArgs...]')
        .action(withRcFileVersion((version, extraArgs) => {
            console.log(`Executing yarn command with version ${version}`)
            const exec = require('./commands/exec')
            exec(version, extraArgs)
        }))

    argParser.parse(args)
}
