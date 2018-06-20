import argParser from 'commander'

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

/* eslint-disable global-require,prettier/prettier */
argParser
    .command('install [version]')
    .action(withRcFileVersion(version => {
        log(`Installing yarn v${version}`)
        const install = require('./commands/install')
        install(version)
    }))

argParser
    .command('remove <version>')
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
    .command('list')
    .action(() => {
        log(`Checking for installed yarn versions...`)
        const listVersions = require('./commands/list')
        listVersions()
    })
/* eslint-enable global-require,prettier/prettier */

argParser.parse(process.argv)