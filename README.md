# Yarn Version Manager (yvm)

<span><img align="right" width="200" height="200" src="https://github.com/tophat/yvm/blob/master/website/static/img/yarn.png" alt="Logo"></span>

<!-- BADGES:START -->

[![YVM Latest Version](https://img.shields.io/github/release/tophat/yvm.svg)](https://github.com/tophat/yvm/releases)
[![Minimum Node Version](https://img.shields.io/badge/node-%3E%3D%208-brightgreen.svg)](https://nodejs.org)
[![Builds](https://img.shields.io/circleci/project/github/tophat/yvm/master.svg)](https://circleci.com/gh/tophat/yvm)
[![codecov](https://codecov.io/gh/tophat/yvm/branch/master/graph/badge.svg?token=idXHLksicU)](https://codecov.io/gh/tophat/yvm)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Deps](https://david-dm.org/tophat/yvm/status.svg)](https://david-dm.org/tophat/yvm)
[![Dev Deps](https://david-dm.org/tophat/yvm/dev-status.svg)](https://david-dm.org/tophat/yvm)
[![Green Keeper](https://badges.greenkeeper.io/tophat/yvm.svg)](https://greenkeeper.io)
[![All Contributors](https://img.shields.io/badge/all_contributors-18-orange.svg?style=flat-square)](#contributors)
[![Slack workspace](https://slackinvite.dev.tophat.com/badge.svg)](https://opensource.tophat.com/slack)
[![Maturity badge - level 3](https://img.shields.io/badge/Maturity-Level%203%20--%20Stable-green.svg)](https://github.com/tophat/getting-started/blob/master/scorecard.md)
[![Pull Reminders](https://pullreminders.com/badge.svg)](https://pullreminders.com?ref=badge)

<!-- BADGES:END -->

## Overview

<!-- OVERVIEW-DOCS:START -->

Pesky yarn versions got you down? Automatically and easilly manage those versions.

YVM will automatically use the correct yarn version when you run any yarn commands in any folder with a `package.json`, `.yvmrc` or any other [supported configuration](https://yvm.js.org/docs/faq#declare-yvm-version-in-a-configuration-file-where-can-i-place-my-version-number) file. Otherwise, it will use you a globally set version of yarn.

## Motivation

Manually managing different yarn versions across projects is a pain. This fixes that.

## Installation

Node: >=8.0.0

### Installation script

Execute the following in your terminal:

```bash
curl -fsSL https://raw.githubusercontent.com/tophat/yvm/master/scripts/install.sh | bash
```

Or to install a specific version:

```bash
curl -fsSL https://raw.githubusercontent.com/tophat/yvm/master/scripts/install.sh | INSTALL_VERSION="v0.9.26" bash
```

### Manual installation

Navigate to [github.com/tophat/yvm/releases](https://github.com/tophat/yvm/releases) and download the `yvm.zip` file for the latest release to your home directory.

Next, unzip that file to the .yvm dir in your home directory and make extracted yvm.sh executable

```bash
unzip yvm.zip -d $HOME/.yvm
chmod a+x $HOME/.yvm/yvm.sh
```

Finally, add the following lines to your `$HOME/.zshrc` or `$HOME/.bashrc`, depending on the shell you use

```bash
export YVM_DIR=/home/joe_user/.yvm
[ -r $YVM_DIR/yvm.sh ] && source $YVM_DIR/yvm.sh
```

And in your `$HOME/.config/fish/config.fish` for fishers:

```fish
set -x YVM_DIR /home/joe_user/.yvm
. $YVM_DIR/yvm.fish
```

### Upgrade

To upgrade yvm to the lastest version either install as normal, or run

```bash
yvm update-self
```

## Usage

### Automatic magic

Run any yarn command and watch it magically use the correct version of yarn

### Basic

To download and install a version of yarn, run:

```bash
yvm install <version>
```

To get the latest version of Yarn, run:

```bash
yvm install latest
```

Execute an arbitrary command using a specific version of yarn:

```bash
yvm exec <version> <command>
```

### Additional commands

Switch the current yarn versions:

```bash
yvm use <version>
yarn --version
```

Control version aliasing:

```bash
yvm alias stable
# stable → 1.13.0 (1.13.0)

yvm alias default stable
# default → stable (1.13.0)

yvm alias
# default → stable (1.13.0)
# latest → 1.14.0 (1.14.0)
# stable → 1.13.0 (1.13.0)
# system → 1.13.0 (1.13.0)

yvm alias default '^1.7'
# default → ^1.7 (1.14.0)
```

Show path to version used:

```bash
yvm which
```

List installed yarn versions:

```bash
yvm list
```

Full list of available commands:

```bash
yvm --help
```

### Configuration file

Yvm defaults to using the `yarn` version in your `package.json` `engines`. Otherwise you can create a `.yvmrc` file containing the version number of yarn in your project's root directory. Afterwards, `yvm use`, `yvm install` and `yvm exec` will use the version specified in the config file if no version number is supplied to the command.
You can also [declare the version using other configuration files](https://yvm.js.org/docs/faq#declare-yvm-version-in-a-configuration-file-where-can-i-place-my-version-number)

<!-- OVERVIEW-DOCS:END -->

### Additional reference

A full list of commands is on the [api reference page](https://yvm.js.org/docs/api)

Have questions? [List of common questions and answers](https://yvm.js.org/docs/faq)

## Removing

To remove yvm simply execute

```bash
rm -rf $YVM_DIR
```

Next, edit `$HOME/.bashrc` and `$HOME/.zshrc` and remove those lines:

```bash
export YVM_DIR=/home/joe_user/.yvm
[ -r $YVM_DIR/yvm.sh ] && source $YVM_DIR/yvm.sh
```

Remove in `$HOME/.config/fish/config.fish` for fishers:

```fish
set -x YVM_DIR /home/joe_user/.yvm
. $YVM_DIR/yvm.fish
```

In case you had older version of yvm installed, there could also be a line like

```bash
source /home/joe_user/.yvm/yvm.sh
```

or those lines could be in `$HOME/.bash_profile` instead of `$HOME/.bashrc`.

## Contributing

<!-- CONTRIBUTING-DOCS:START -->

We welcome contributions from the community, Top Hatters and non-Top Hatters alike. Here are some guidelines to help you get started!

### Basic development flow

1. Ensure the problem you are solving [is an issue](https://github.com/tophat/yvm/issues) or you've created one
2. Clone the repo
3. We use make. `make help` will show you a list of development commands
4. `make install-watch` will install yvm on your shell, update when you make changes, and automatically source yvm.sh. Make sure to only run this in the root yvm directory. It will fail elsewhere.
5. `make test` and `make lint` are also commonly helpful

Make sure all changes are well documented. Our documentation can be found inside the `docs` section of this repo. Be sure to read it carefully and make modifications wherever necessary.
You can also access the documentation on our [website](https://yvm.js.org)

Please make sure to look over our [Code of Conduct](https://github.com/tophat/getting-started/blob/master/code-of-conduct.md) as well!

### Manual testing command contributions

```bash
make install
yvm <your-command-here>
```

### Technologies to Familiarize Yourself with

- [NodeJS](https://github.com/nodejs/node)
- [Yarn](https://github.com/yarnpkg/yarn)

<!-- CONTRIBUTING-DOCS:END -->

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars3.githubusercontent.com/u/3876970?v=4" width="100px;" alt="Francois Campbell"/><br /><sub><b>Francois Campbell</b></sub>](https://github.com/francoiscampbell)<br />[💻](https://github.com/tophat/yvm/commits?author=francoiscampbell "Code") | [<img src="https://avatars2.githubusercontent.com/u/3534236?v=4" width="100px;" alt="Jake Bolam"/><br /><sub><b>Jake Bolam</b></sub>](https://jakebolam.com)<br />[📖](https://github.com/tophat/yvm/commits?author=jakebolam "Documentation") [💻](https://github.com/tophat/yvm/commits?author=jakebolam "Code") [🚇](#infra-jakebolam "Infrastructure (Hosting, Build-Tools, etc)") | [<img src="https://avatars1.githubusercontent.com/u/39271619?v=4" width="100px;" alt="Brandon Baksh"/><br /><sub><b>Brandon Baksh</b></sub>](https://www.linkedin.com/in/brandonbaksh/)<br />[💻](https://github.com/tophat/yvm/commits?author=brandonbaksh "Code") | [<img src="https://avatars3.githubusercontent.com/u/2070398?v=4" width="100px;" alt="Milan Milojic"/><br /><sub><b>Milan Milojic</b></sub>](https://github.com/nepodmitljivi)<br />[💻](https://github.com/tophat/yvm/commits?author=nepodmitljivi "Code") | [<img src="https://avatars2.githubusercontent.com/u/38886386?v=4" width="100px;" alt="Umar Ahmed"/><br /><sub><b>Umar Ahmed</b></sub>](https://github.com/umar-tophat)<br />[💻](https://github.com/tophat/yvm/commits?author=umar-tophat "Code") | [<img src="https://avatars0.githubusercontent.com/u/3258756?v=4" width="100px;" alt="Nicholas Dujay"/><br /><sub><b>Nicholas Dujay</b></sub>](https://github.com/dat2)<br />[💻](https://github.com/tophat/yvm/commits?author=dat2 "Code") | [<img src="https://avatars0.githubusercontent.com/u/3996927?v=4" width="100px;" alt="Aser Eldamaty"/><br /><sub><b>Aser Eldamaty</b></sub>](https://github.com/aeldamaty)<br />[💻](https://github.com/tophat/yvm/commits?author=aeldamaty "Code") |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| [<img src="https://avatars3.githubusercontent.com/u/3495264?v=4" width="100px;" alt="Michael Rose"/><br /><sub><b>Michael Rose</b></sub>](http://msrose.github.io)<br />[💻](https://github.com/tophat/yvm/commits?author=msrose "Code") | [<img src="https://avatars0.githubusercontent.com/u/8632167?v=4" width="100px;" alt="Sanchit Gera"/><br /><sub><b>Sanchit Gera</b></sub>](http://www.sanchitgera.ca)<br />[📖](https://github.com/tophat/yvm/commits?author=sanchitgera "Documentation") | [<img src="https://avatars0.githubusercontent.com/u/6020693?v=4" width="100px;" alt="sdcosta"/><br /><sub><b>sdcosta</b></sub>](https://github.com/sdcosta)<br />[📖](https://github.com/tophat/yvm/commits?author=sdcosta "Documentation") | [<img src="https://avatars1.githubusercontent.com/u/445636?v=4" width="100px;" alt="Siavash Mahmoudian"/><br /><sub><b>Siavash Mahmoudian</b></sub>](https://breezio.com)<br />[🚇](#infra-syavash "Infrastructure (Hosting, Build-Tools, etc)") | [<img src="https://avatars3.githubusercontent.com/in/505?v=4" width="100px;" alt="greenkeeper[bot]"/><br /><sub><b>greenkeeper[bot]</b></sub>](https://github.com/apps/greenkeeper)<br />[🚇](#infra-greenkeeper[bot] "Infrastructure (Hosting, Build-Tools, etc)") | [<img src="https://avatars0.githubusercontent.com/u/7827407?v=4" width="100px;" alt="Jay Crumb"/><br /><sub><b>Jay Crumb</b></sub>](https://github.com/jcrumb)<br />[📖](https://github.com/tophat/yvm/commits?author=jcrumb "Documentation") | [<img src="https://avatars0.githubusercontent.com/u/1097941?v=4" width="100px;" alt="Michael Lunøe"/><br /><sub><b>Michael Lunøe</b></sub>](http://m.lunoe.dk)<br />[📖](https://github.com/tophat/yvm/commits?author=mlunoe "Documentation") |
| [<img src="https://avatars3.githubusercontent.com/u/1558352?v=4" width="100px;" alt="Yash Shah"/><br /><sub><b>Yash Shah</b></sub>](http://www.yashshah.com)<br />[💻](https://github.com/tophat/yvm/commits?author=yashshah "Code") | [<img src="https://avatars0.githubusercontent.com/u/9504927?v=4" width="100px;" alt="Wacław Schiller"/><br /><sub><b>Wacław Schiller</b></sub>](https://github.com/torinthiel)<br />[💻](https://github.com/tophat/yvm/commits?author=torinthiel "Code") | [<img src="https://avatars0.githubusercontent.com/u/45925873?v=4" width="100px;" alt="yvm-bot"/><br /><sub><b>yvm-bot</b></sub>](https://github.com/yvm-bot)<br />[🚇](#infra-yvm-bot "Infrastructure (Hosting, Build-Tools, etc)") | [<img src="https://avatars0.githubusercontent.com/u/2528959?v=4" width="100px;" alt="Emmanuel Ogbizi"/><br /><sub><b>Emmanuel Ogbizi</b></sub>](http://emmanuel.ogbizi.com/)<br />[💻](https://github.com/tophat/yvm/commits?author=iamogbz "Code") [⚠️](https://github.com/tophat/yvm/commits?author=iamogbz "Tests") [📖](https://github.com/tophat/yvm/commits?author=iamogbz "Documentation") | [<img src="https://avatars3.githubusercontent.com/u/2723622?v=4" width="100px;" alt="Martin Lai"/><br /><sub><b>Martin Lai</b></sub>](https://github.com/eastenluis)<br />[💻](https://github.com/tophat/yvm/commits?author=eastenluis "Code") |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!

## Credits

Thanks to [Carol Skelly](https://github.com/iatek) for donating the github organization!
