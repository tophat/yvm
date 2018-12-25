---
id: overview
title: Overview
---

[![Builds](https://img.shields.io/circleci/project/github/tophat/yvm/master.svg)](https://circleci.com/gh/tophat/yvm) [![codecov](https://codecov.io/gh/tophat/yvm/branch/master/graph/badge.svg?token=idXHLksicU)](https://codecov.io/gh/tophat/yvm) [![Deps](https://david-dm.org/tophat/yvm/status.svg)](https://david-dm.org/tophat/yvm) [![Dev Deps](https://david-dm.org/tophat/yvm/dev-status.svg)](https://david-dm.org/tophat/yvm?type=dev)

Pesky yarn versions got you down? Automatically and easilly manage those versions.

YVM will automatically use the correct yarn version when you run any yarn commands in any folder with a `.yvmrc` file. Otherwise, it will use you a globally set version of yarn.


## Installation
Node: >=4.8.0


Execute the following in your terminal:

```bash
curl -fsSL https://raw.githubusercontent.com/tophat/yvm/master/scripts/install.sh | bash
```

Or if already installed, to update to the latest version
```bash
yvm update-self
```

Or to install a specific version:
```bash
curl -fsSL https://raw.githubusercontent.com/tophat/yvm/master/scripts/install.sh | INSTALL_VERSION="v0.9.26" bash
```

## Usage

### Automatic magic
Run any yarn command and watch it magically use the correct version of yarn

### Basic

To download and install a version of yarn, run:

```bash
yvm install <version>
```

To install the latest version of yarn, run:

```bash
yvm install --latest
```

Execute an arbitrary command using a specific version of yarn:

```bash
yvm exec <version> <command>
```

### Additional commands
Switch the current yarn versions, using:

```bash
yvm use <version>
yarn --version
```

List Versions
```bash
yvm list
```

Check Current Version
```bash
yvm which
```

Full list of available commands
```bash
yvm help
```

### Using a .yvmrc File
You can create a `.yvmrc` file containing the version number of yarn in your project's root directory. Afterwards, `yvm use`, `yvm install` and `yvm exec` will use the version specified in the `.yvmrc` file if no version number is supplied to the command.
You can also [declare the version using other configuration files](/docs/faq)
