# Overview

[![Builds](https://img.shields.io/circleci/project/github/tophatmonocle/yvm.svg)](https://circleci.com/gh/tophatmonocle/yvm) [![codecov](https://codecov.io/gh/tophatmonocle/yvm/branch/master/graph/badge.svg?token=idXHLksicU)](https://codecov.io/gh/tophatmonocle/yvm) [![Deps](https://david-dm.org/tophatmonocle/yvm/status.svg)](https://david-dm.org/tophatmonocle/yvm) [![Dev Deps](https://david-dm.org/tophatmonocle/yvm/dev-status.svg)](https://david-dm.org/tophatmonocle/yvm?type=dev)

Yarn version manager

Pesky yarn versions got you down? Manage those versions


## Installation
Node: >=4.8.0


Execute the following in your terminal:

```bash
curl https://raw.githubusercontent.com/tophatmonocle/yvm/master/scripts/install.sh | bash
```

## Usage

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


### Additional reference
A full list of commands is on the [api reference page](docs/api.md)

Have questions? [List of common questions and answers](docs/faq.md)


## Contributing

Thanks goes to these wonderful people [emoji key](https://github.com/kentcdodds/all-contributors#emoji-key):

| [<img src="https://avatars.githubusercontent.com/u/3876970?s=100"/><br /><sub><b>Francois Campbell</b></sub>](https://github.com/francoiscampbell)<br />[💻](https://github.com/tophatmonocle/yvm/commits?author=francoiscampbell) | [<img src="https://avatars.githubusercontent.com/u/3534236?s=100" width="100px;"/><br /><sub><b>Jake Bolam</b></sub>](https://github.com/jakebolam)<br />[📖](https://github.com/bundlewatch/bundlewatch/commits?author=jakebolam) | [<img src="https://avatars.githubusercontent.com/u/39271619?s=100" width="100px;"/><br /><sub><b>Brandon Baksh</b></sub>](https://github.com/brandonbaksh)<br />[💻](https://github.com/tophatmonocle/yvm/commits?author=brandonbaksh) | [<img src="https://avatars.githubusercontent.com/u/2070398?s=100" width="100px;"/><br /><sub><b>Milan Milojic</b></sub>](https://github.com/nepodmitljivi)<br />[💻](https://github.com/tophatmonocle/yvm/commits?author=nepodmitljivi) | [<img src="https://avatars.githubusercontent.com/u/38886386?s=100" width="100px;"/><br /><sub><b>Umar Ahmed</b></sub>](https://github.com/umar-tophat)<br />[💻](https://github.com/tophatmonocle/yvm/commits?author=umar-tophat) |
| :---: | :---: | :---: | :---: | :---: |


We welcome contributions from the community, Top Hatters and non-Top Hatters alike. Check out our [contributing guidelines](docs/contributing.md) for more details.

## Copyright

© 2018 Tophatmonocle Corp

