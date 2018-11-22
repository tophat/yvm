# Overview

[![Builds](https://img.shields.io/circleci/project/github/tophat/yvm/master.svg)](https://circleci.com/gh/tophat/yvm) [![codecov](https://codecov.io/gh/tophat/yvm/branch/master/graph/badge.svg?token=idXHLksicU)](https://codecov.io/gh/tophat/yvm) [![Deps](https://david-dm.org/tophat/yvm/status.svg)](https://david-dm.org/tophat/yvm) [![Dev Deps](https://david-dm.org/tophat/yvm/dev-status.svg)](https://david-dm.org/tophat/yvm?type=dev)

Yarn Version Manager

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
You can also [declare the version using other configuration files](docs/faq.md)

### Additional reference
A full list of commands is on the [api reference page](docs/api.md)

Have questions? [List of common questions and answers](docs/faq.md)


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


### Manual testing command contributions

```bash
make install
yvm <your-command-here>
```

## Credits

Thanks goes to these wonderful people [emoji key](https://github.com/kentcdodds/all-contributors#emoji-key):

| [<img src="https://avatars.githubusercontent.com/u/3876970?s=100"/><br /><sub><b>Francois Campbell</b></sub>](https://github.com/francoiscampbell)<br />[💻](https://github.com/tophat/yvm/commits?author=francoiscampbell) | [<img src="https://avatars.githubusercontent.com/u/3534236?s=100" width="100px;"/><br /><sub><b>Jake Bolam</b></sub>](https://github.com/jakebolam)<br />[📖](https://github.com/bundlewatch/bundlewatch/commits?author=jakebolam) | [<img src="https://avatars.githubusercontent.com/u/39271619?s=100" width="100px;"/><br /><sub><b>Brandon Baksh</b></sub>](https://github.com/brandonbaksh)<br />[💻](https://github.com/tophat/yvm/commits?author=brandonbaksh) |
| :---: | :---: | :---: |
| [<img src="https://avatars.githubusercontent.com/u/2070398?s=100" width="100px;"/><br /><sub><b>Milan Milojic</b></sub>](https://github.com/nepodmitljivi)<br />[💻](https://github.com/tophat/yvm/commits?author=nepodmitljivi) | [<img src="https://avatars.githubusercontent.com/u/38886386?s=100" width="100px;"/><br /><sub><b>Umar Ahmed</b></sub>](https://github.com/umar-tophat)<br />[💻](https://github.com/tophat/yvm/commits?author=umar-tophat) |[<img src="https://avatars.githubusercontent.com/u/3258756?s=100" width="100px;"/><br /><sub><b>Nicholas Dujay</b></sub>](https://github.com/dat2)<br />[💻](https://github.com/tophat/yvm/commits?author=dat2) |
| :---: | :---: | :---: |
[<img src="https://avatars.githubusercontent.com/u/3996927?s=100" width="100px;"/><br /><sub><b>Aser Eldamaty</b></sub>](https://github.com/aeldamaty)<br />[💻](https://github.com/tophat/yvm/commits?author=aeldamaty) | [<img src="https://avatars.githubusercontent.com/u/3495264?s=100" width="100px;"/><br /><sub><b>Michael Rose</b></sub>](https://github.com/msrose)<br />[💻](https://github.com/tophat/yvm/commits?author=msrose) | [<img src="https://avatars.githubusercontent.com/u/8632167?s=100" width="100px;"/><br /><sub><b>Sanchit Gera</b></sub>](https://github.com/sanchitgera)<br />[📖](https://github.com/tophat/yvm/commits?author=sanchitgera) |
| :---: | :---: | :---: |
[<img src="https://avatars.githubusercontent.com/u/6020693?s=460&v=4?s=100" width="100px;"/><br /><sub><b>Shouvik D'Costa</b></sub>](https://github.com/sdcosta)<br />[📖](https://github.com/tophat/yvm/commits?author=sdcosta) | 

Thanks to [Carol Skelly](https://github.com/iatek) for donating the github organization!


