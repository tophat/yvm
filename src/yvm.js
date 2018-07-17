const argParser = require('commander')

const {
    getRcFileVersion,
    isValidVersionString,
    validateVersionString,
} = require('./util/version')
const log = require('./common/log')

// eslint-disable-next-line consistent-return
const getYarnVersion = (maybeVersionArg, ...rest) => {
    if (maybeVersionArg) {
        if (isValidVersionString(maybeVersionArg)) {
            log.info(`Using provided version: ${maybeVersionArg}`)
            return [maybeVersionArg, ...rest]
        }
    }

    rest.unshift(maybeVersionArg)

    try {
        const version = getRcFileVersion()
        validateVersionString(version)
        log.info(`Using yarn version: ${version}`)
        return [version, ...rest]
    } catch (e) {
        log(e.message)
        process.exit(1)
    }
}

const invalidCommandLog = () =>
    log(
        'You need to source yvm to use this command. run `source /usr/local/bin/yvm`',
    )

/* eslint-disable global-require,prettier/prettier */
argParser
    .description('Yarn Version Manager')

if (!process.argv.includes('exec')) {
    argParser
        .command('*', '', {noHelp: true, isDefault: true})
        .action(invalidCommand => {
            log(`Invalid command: ${invalidCommand}`)
            argParser.outputHelp()
            process.exit(1)
        })
}

argParser
    .command('install [version]')
    .alias('i')
    .description('Install the specified version of Yarn.')
    .action(maybeVersion => {
        const [version] = getYarnVersion(maybeVersion)
        const install = require('./commands/install')
        install(version)
    })

argParser
    .command('remove <version>')
    .alias('rm')
    .description('Uninstall the specified version of Yarn.')
    .action(version => {
        log.info(`Removing yarn v${version}`)
        const remove = require('./commands/remove')
        process.exit(remove(version))
    })

argParser
    .command('exec [version] [command]', 'Execute command using specified Yarn version.')

argParser
    .command('use [version]')
    .description('Activate specified Yarn version, or use .yvmrc if present.')
    .action(invalidCommandLog)

argParser
    .command('which')
    .description('Display path to installed yarn version. Uses .yvmrc if available.')
    .action(() => {
        log.info(`Checking yarn version`)
        const which = require('./commands/which')
        process.exit(which())
})

argParser
    .command('list-remote')
    .alias('ls-remote')
    .description('List Yarn versions available to install.')
    .action(() => {
        const listRemote = require('./commands/listRemote')
        listRemote()
    })

argParser
    .command('list')
    .alias('ls')
    .description('List the currently installed versions of Yarn.')
    .action(() => {
        log.info(`Checking for installed yarn versions...`)
        const listVersions = require('./commands/list')
        listVersions()
    })

argParser
    .command('get-new-path [version]')
    .description('Internal command: Gets a new PATH string for "yvm use"')
    .action(maybeVersion => {
        const [version] = getYarnVersion(maybeVersion)
        const getNewPath = require('./commands/getNewPath')
        log.capturable(getNewPath(version))
    })

argParser
    .command('update-self')
    .description('Updates yvm to the latest version')
    .action(invalidCommandLog)

argParser
    .command('help')
    .description('Show help text')
    .action(() => argParser.outputHelp())

/* eslint-enable global-require,prettier/prettier */
argParser.parse(process.argv)
