const argParser = require('commander')

const {
    getSplitVersionAndArgs,
    setDefaultVersion,
    getDefaultVersion,
    getValidVersionString,
} = require('./util/version')
const log = require('./util/log')

const invalidCommandLog = () =>
    log(
        'You need to source yvm to use this command. run `source ~/.yvm/yvm.sh`',
    )

/* eslint-disable global-require,prettier/prettier */
argParser.description('Yarn Version Manager')

if (!process.argv.includes('exec')) {
    argParser
        .command('*', '', { noHelp: true, isDefault: true })
        .action(invalidCommand => {
            if (!process.argv.includes('help')) {
                log(`Invalid command: ${invalidCommand}`)
            }
            argParser.outputHelp()
            process.exit(1)
        })
}

argParser
    .command('install [version]')
    .alias('i')
    .option('-l, --latest', 'Install the latest version of Yarn available')
    .description('Install the specified version of Yarn.')
    .action(async (maybeVersion, command) => {
        const { installVersion, installLatest } = require('./commands/install')
        const handleError = error => {
            log.error(error)
            process.exit(1)
        }
        if (command.latest) {
            installLatest().catch(handleError)
            return
        }
        const version = maybeVersion || await getSplitVersionAndArgs()[0]
        installVersion({ version }).catch(handleError)
    })

argParser
    .command('remove <version>')
    .alias('rm')
    .description('Uninstall the specified version of Yarn.')
    .action(async version => {
        log.info(`Removing yarn v${version}`)
        const remove = require('./commands/remove')
        process.exit(await remove(version))
    })

// commander has support for sub commands, and will load the file yvm-exec when this is run
argParser.command(
    'exec [version] [command]',
    'Execute command using specified Yarn version.',
)

argParser
    .command('use [version]')
    .description('Activate specified Yarn version, or use .yvmrc if present.')
    .action(invalidCommandLog)

argParser
    .command('which')
    .description(
        'Display path to installed yarn version. Uses .yvmrc if available.',
    )
    .action(async () => {
        log.info('Checking yarn version')
        const which = require('./commands/which')
        process.exit(await which())
    })

argParser
    .command('list-remote')
    .alias('ls-remote')
    .description('List Yarn versions available to install.')
    .action(() => {
        log.info('Checking for available yarn versions...')
        const listRemote = require('./commands/listRemote')
        listRemote()
    })

argParser
    .command('list')
    .alias('ls')
    .description('List the currently installed versions of Yarn.')
    .action(() => {
        log.info('Checking for installed yarn versions...')
        const listVersions = require('./commands/list')
        listVersions()
})

argParser
    .command('get-new-path [version]')
    .option('--shell [shell]', 'Shell used when getting PATH')
    .description(
        'Internal command: Gets a new PATH string for "yvm use", installing the version if necessary',
    )
    .action(async (maybeVersion, command) => {
        const [version] = await getSplitVersionAndArgs(maybeVersion)
        const isFishShell = command.shell === 'fish'
        const getNewPath = isFishShell ? require('./commands/fish/getNewFishUserPath') : require('./commands/getNewPath')
        const { ensureVersionInstalled } = require('./commands/install')
        ensureVersionInstalled(version)
            .then(() => log.capturable(getNewPath(version)))
            .catch(error => {
                log.error(error)
                process.exit(1)
            })
    })

argParser
    .command('set-default <version>')
    .description(
        'Sets the default fallback yarn version, if not supplied and no .yvmrc found',
    )
    .action(version => {
        const parsedVersionString = getValidVersionString(version)
        if (!parsedVersionString) {
            log('Error: Invalid version string supplied.')
            process.exit(1)
            return
        }
        if (setDefaultVersion({ version: parsedVersionString })) {
            log('Default version set!')
        } else {
            process.exit(2)
        }
    })

argParser
    .command('get-default-version')
    .description('Gets the default set yarn version')
    .action(() => {
        const version = getDefaultVersion()
        if (version) {
            log.capturable(version)
        } else {
            log('No default yarn version set')
            process.exit(1)
        }
    })

argParser
    .command('version')
    .description('Outputs the version of yvm that is installed')
    .action(() => {
        const yvmVersion = require('./commands/yvmVersion')
        process.exit(yvmVersion())
    })

argParser
    .command('update-self')
    .description('Updates yvm to the latest version')
    .action(invalidCommandLog)

/* eslint-enable global-require,prettier/prettier */
argParser.parse(process.argv)
