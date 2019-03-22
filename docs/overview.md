---
id: overview
title: Overview
---

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
