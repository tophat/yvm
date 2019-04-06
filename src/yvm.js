import argParser from 'commander'

import log from './util/log'
import { yvmInstalledVersion } from './util/yvmInstalledVersion'

const messageNoYvm = 'Unable to determine yvm version'
const messageSourceYvm =
    'You need to source yvm to use this command. run `source ~/.yvm/yvm.sh`'
const messageOptionalVersion = msg => `${msg}. Uses config file if available.`
const signPosting = command => `See -> 'yvm ${command}'`

argParser.description('Yarn Version Manager')
argParser.addImplicitHelpCommand = () => {}

if (!process.argv.includes('exec')) {
    argParser.version(yvmInstalledVersion() || messageNoYvm)
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
    .option('-l, --latest', signPosting`install latest`)
    .option('-s, --stable', signPosting`install stable`)
    .description(messageOptionalVersion`Install the specified version of Yarn`)
    .action(async (maybeVersion, command) => {
        const { install } = await import('./commands/install')
        const exitCode = await install({
            latest: command.latest,
            stable: command.stable,
            version: maybeVersion,
        })
        process.exit(exitCode)
    })

const uninstallVersion = async version => {
    const { remove } = await import('./commands/remove')
    process.exit(await remove(version))
}
argParser
    .command('uninstall <version>')
    .alias('rm')
    .description('Uninstall the specified version of Yarn.')
    .action(uninstallVersion)

argParser
    .command('use [version]')
    .description(messageOptionalVersion`Activate specified Yarn version`)
    .action(() => log(messageSourceYvm))

argParser
    .command('exec [version] [args...]')
    .option('-h, --help')
    .allowUnknownOption()
    .description(
        messageOptionalVersion`Execute command using specified Yarn version`,
    )
    .action(async () => {
        const [, , , maybeVersion, ...rest] = process.argv
        const { exec } = await import('./commands/exec')
        process.exit(await exec(maybeVersion, rest))
    })

argParser
    .command('current')
    .description('Display current active Yarn version')
    .action(async command => {
        log.info('Checking Yarn version')
        const { current } = await import('./commands/current')
        process.exit(await current(command))
    })

argParser
    .command('list')
    .alias('ls')
    .description('List the currently installed versions of Yarn.')
    .action(async () => {
        const { list } = await import('./commands/list')
        process.exit(await list())
    })

argParser
    .command('list-remote')
    .alias('ls-remote')
    .description('List Yarn versions available to install.')
    .action(async () => {
        const { listRemote } = await import('./commands/listRemote')
        process.exit(await listRemote())
    })

argParser.command('alias [<pattern>]', 'Show all aliases matching <pattern>')
argParser.command(
    'alias <name> <version>',
    'Set an alias named <name> pointing to <version>',
)
argParser.command('alias', '', { noHelp: true }).action(async () => {
    const [, , , nameOrPattern, maybeVersion] = process.argv
    const { alias } = await import('./commands/alias')
    process.exit(await alias(nameOrPattern, maybeVersion))
})

argParser
    .command('unalias <name>')
    .option('-F, --force', 'Delete even if other aliases will be broken')
    .option('-R, --recursive', 'Delete all dependant aliases as well')
    .description('Deletes the alias named <name>')
    .action(async (name, { force, recursive }) => {
        const { unalias } = await import('./commands/unalias')
        process.exit(await unalias({ name, force, recursive }))
    })

argParser
    .command('which [version]')
    .description(messageOptionalVersion`Display path to Yarn version`)
    .action(async maybeVersion => {
        log.info('Getting path to Yarn version')
        const { which } = await import('./commands/which')
        process.exit(await which({ version: maybeVersion }))
    })

argParser
    .command('update-self')
    .description('Updates yvm to the latest version')
    .action(() => log(messageSourceYvm))

argParser
    .command('get-new-path [version]', '', { noHelp: true })
    .option('--shell [shell]', 'Shell used when getting PATH')
    .description(
        'Internal command: Gets a new PATH string for "yvm use", installing the version if necessary',
    )
    .action(async (maybeVersion, { shell }) => {
        const { getSplitVersionAndArgs } = await import('./util/version')
        try {
            const [version] = await getSplitVersionAndArgs(maybeVersion)
            const { getNewPath } = await import('./commands/getNewPath')
            const {
                ensureVersionInstalled,
            } = await import('./commands/install')
            await ensureVersionInstalled(version)
            log.capturable(getNewPath({ version, shell }))
        } catch (error) {
            log.error(error)
            process.exit(1)
        }
    })

argParser
    .command('version')
    .description(signPosting`--version`)
    .action(() => {
        const version = yvmInstalledVersion()
        log.capturable(version || messageNoYvm)
        process.exit(version ? 0 : 1)
    })

argParser
    .command('remove <version>')
    .description(signPosting`uninstall`)
    .action(uninstallVersion)

argParser
    .command('set-default <version>')
    .description(signPosting`alias default <version>`)
    .action(async version => {
        const { setDefaultVersion } = await import('./util/version')
        if (await setDefaultVersion({ version })) {
            log('Default version set!')
        } else {
            process.exit(2)
        }
    })

argParser
    .command('get-default-version')
    .description(signPosting`alias default`)
    .action(async () => {
        const { getDefaultVersion } = await import('./util/version')
        const version = await getDefaultVersion()
        if (version) {
            log.capturable(version)
        } else {
            log('No default yarn version set')
            process.exit(1)
        }
    })

argParser.parse(process.argv)
