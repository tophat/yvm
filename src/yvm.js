const argParser = require('commander')

const { ensureVersionInstalled } = require('./util/install')
const { getSplitVersionAndArgs } = require('./util/version')
const log = require('./util/log')

const invalidCommandLog = () =>
    log(
        'You need to source yvm to use this command. run `source /usr/local/bin/yvm`',
    )

/* eslint-disable global-require,prettier/prettier */
argParser
  .description('Yarn Version Manager');

if (!process.argv.includes('exec')) {
  argParser
    .command('*', '', { noHelp: true, isDefault: true })
    .action((invalidCommand) => {
      log(`Invalid command: ${invalidCommand}`);
      argParser.outputHelp();
      process.exit(1);
    });
}

argParser
  .command('install [version]')
  .alias('i')
  .description('Install the specified version of Yarn.')
  .action((maybeVersion) => {
    const [version] = getSplitVersionAndArgs(maybeVersion);
    const install = require('./commands/install');
    install(version);
  });

argParser
  .command('remove <version>')
  .alias('rm')
  .description('Uninstall the specified version of Yarn.')
  .action((version) => {
    log.info(`Removing yarn v${version}`);
    const remove = require('./commands/remove');
    process.exit(remove(version));
  });

argParser
  .command('exec [version] [command]', 'Execute command using specified Yarn version.');

argParser
  .command('use [version]')
  .description('Activate specified Yarn version, or use .yvmrc if present.')
  .action(invalidCommandLog);

argParser
  .command('which')
  .description('Display path to installed yarn version. Uses .yvmrc if available.')
  .action(() => {
    log.info('Checking yarn version');
    const which = require('./commands/which');
    process.exit(which());
  });

argParser
  .command('list-remote')
  .alias('ls-remote')
  .description('List Yarn versions available to install.')
  .action(() => {
    const listRemote = require('./commands/listRemote');
    listRemote();
  });

argParser
  .command('list')
  .alias('ls')
  .description('List the currently installed versions of Yarn.')
  .action(() => {
    log.info('Checking for installed yarn versions...');
    const listVersions = require('./commands/list');
    listVersions();
  });

argParser
  .command('get-new-path [version]')
  .description('Internal command: Gets a new PATH string for "yvm use", installing the version if necessary')
  .action((maybeVersion) => {
    const [version] = getSplitVersionAndArgs(maybeVersion);
    const getNewPath = require('./commands/getNewPath');
    ensureVersionInstalled(version).then(() => log.capturable(getNewPath(version)));
  });

argParser
  .command('update-self')
  .description('Updates yvm to the latest version')
  .action(invalidCommandLog);

argParser
  .command('help')
  .description('Show help text')
  .action(() => argParser.outputHelp());

const noParams = !process.argv.slice(2).length;
if (noParams) {
  argParser.outputHelp();
}

/* eslint-enable global-require,prettier/prettier */
argParser.parse(process.argv)
