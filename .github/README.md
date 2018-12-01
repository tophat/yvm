<div align="center">
    <a href="https://github.com/tophat/yvm">
        <img width="200" height="200" src="https://github.com/tophat/yvm/blob/master/website/static/img/yarn.png">
    </a>
    <br />
    <a href="https://circleci.com/gh/tophat/yvm">
        <img alt="Builds" src="https://img.shields.io/circleci/project/github/tophat/yvm/master.svg"/>
    </a>
    <a href="https://codecov.io/gh/tophat/yvm">
        <img alt="codecov" src="https://codecov.io/gh/tophat/yvm/branch/master/graph/badge.svg?token=idXHLksicU"/>
    </a>
    <a href="https://david-dm.org/tophat/yvm">
        <img alt="Deps" src="https://david-dm.org/tophat/yvm/status.svg"/>
    </a>
    <a href="https://david-dm.org/tophat/yvm">
        <img alt="Dev Deps" src="https://david-dm.org/tophat/yvm/dev-status.svg"/>
    </a>
    <br />
    <a href="#contributors">
        <img alt="All Contributors" src="https://img.shields.io/badge/all_contributors-10-orange.svg?style=flat-square"/>
    </a>
    <a href="https://opensource.tophat.com/#join-slack">
        <img alt="Slack workspace" src="https://slackinvite.dev.tophat.com/badge.svg"/>
    </a>    
    <a href="https://github.com/tophat/getting-started/blob/master/scorecard.md">
        <img alt="Maturity badge - level 3" src="https://img.shields.io/badge/Maturity-Level%203%20--%20Stable-green.svg"/>
    </a>
</div>

# Overview

[![Greenkeeper badge](https://badges.greenkeeper.io/tophat/yvm.svg)](https://greenkeeper.io/)

Yarn Version Manager

Pesky yarn versions got you down? Automatically and easilly manage those versions.

YVM will automatically use the correct yarn version when you run any yarn commands in any folder with a `.yvmrc` file. Otherwise, it will use you a globally set version of yarn.


## Motivation
Manually managing different yarn versions across projects is a pain. This fixes that.


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

## Usage

### Automatic magic
Run any yarn command and watch it magically use the correct version of yarn

### Basic

To download and install a version of yarn, run:

```bash
yvm install <version>
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
You can also [declare the version using other configuration files](../docs/faq.md)

### Additional reference
A full list of commands is on the [api reference page](../docs/api.md)

Have questions? [List of common questions and answers](../docs/faq.md)

## Technologies to Familiarize Yourself with
- [NodeJS](https://github.com/nodejs/node)
- [Yarn](https://github.com/yarnpkg/yarn)


## Contributing
We welcome contributions from the community, Top Hatters and non-Top Hatters alike. Here are some guidelines to help you get started!

### Basic development flow

1. Ensure the problem you are solving [is an issue](https://github.com/tophat/yvm/issues) or you've created one
1. Clone the repo
1. We use make. `make help` will show you a list of development commands
1. `make install-watch` will install yvm on your shell, and update when you make changes. Make sure to only run this in the root yvm directory. It will fail elsewhere.
1. Run `source yvm.sh` every time you make a change to yvm.sh to have changes appear
1. `make test` and `make lint` are also commonly helpful

Make sure all changes are well documented. Our documentation can be found inside the `docs` section of this repo. Be sure to read it carefully and make modifications wherever necessary.
You can also access the documentation on our [website](https://yvm.js.org)

Please make sure to look over our [Code of Conduct](https://github.com/tophat/getting-started/blob/master/code-of-conduct.md) as well!


### Manual testing command contributions

```bash
make install
yvm <your-command-here>
```


## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars3.githubusercontent.com/u/3876970?v=4" width="100px;"/><br /><sub><b>Francois Campbell</b></sub>](https://github.com/francoiscampbell)<br />[💻](https://github.com/tophat/yvm/commits?author=francoiscampbell "Code") | [<img src="https://avatars2.githubusercontent.com/u/3534236?v=4" width="100px;"/><br /><sub><b>Jake Bolam</b></sub>](https://jakebolam.com)<br />[📖](https://github.com/tophat/yvm/commits?author=jakebolam "Documentation") | [<img src="https://avatars1.githubusercontent.com/u/39271619?v=4" width="100px;"/><br /><sub><b>Brandon Baksh</b></sub>](https://www.linkedin.com/in/brandonbaksh/)<br />[💻](https://github.com/tophat/yvm/commits?author=brandonbaksh "Code") | [<img src="https://avatars3.githubusercontent.com/u/2070398?v=4" width="100px;"/><br /><sub><b>Milan Milojic</b></sub>](https://github.com/nepodmitljivi)<br />[💻](https://github.com/tophat/yvm/commits?author=nepodmitljivi "Code") | [<img src="https://avatars2.githubusercontent.com/u/38886386?v=4" width="100px;"/><br /><sub><b>Umar Ahmed</b></sub>](https://github.com/umar-tophat)<br />[💻](https://github.com/tophat/yvm/commits?author=umar-tophat "Code") | [<img src="https://avatars0.githubusercontent.com/u/3258756?v=4" width="100px;"/><br /><sub><b>Nicholas Dujay</b></sub>](https://github.com/dat2)<br />[💻](https://github.com/tophat/yvm/commits?author=dat2 "Code") | [<img src="https://avatars0.githubusercontent.com/u/3996927?v=4" width="100px;"/><br /><sub><b>Aser Eldamaty</b></sub>](https://github.com/aeldamaty)<br />[💻](https://github.com/tophat/yvm/commits?author=aeldamaty "Code") |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| [<img src="https://avatars3.githubusercontent.com/u/3495264?v=4" width="100px;"/><br /><sub><b>Michael Rose</b></sub>](http://msrose.github.io)<br />[💻](https://github.com/tophat/yvm/commits?author=msrose "Code") | [<img src="https://avatars0.githubusercontent.com/u/8632167?v=4" width="100px;"/><br /><sub><b>Sanchit Gera</b></sub>](http://www.sanchitgera.ca)<br />[📖](https://github.com/tophat/yvm/commits?author=sanchitgera "Documentation") | [<img src="https://avatars0.githubusercontent.com/u/6020693?v=4" width="100px;"/><br /><sub><b>sdcosta</b></sub>](https://github.com/sdcosta)<br />[📖](https://github.com/tophat/yvm/commits?author=sdcosta "Documentation") |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!

## Credits

Thanks to [Carol Skelly](https://github.com/iatek) for donating the github organization!
