<div align="center">
 
[![builds][builds]][builds-url]
[![deps][deps]][deps-url]
[![dev-deps][dev-deps]][dev-deps-url]


  <h1>Yarn version manager</h1>
  <p>
    Pesky yarn versions got you down? Manage those versions
  </p>
</div>


# Introduction

## Table of Contents

* [Installation](./#installation)
  * [Install via Git](./#install-via-git)
  * [Install via cURL](./#install-via-curl)
* [Usage](./#usage)
  * [Basic](./#basic)
  * [List Versions](./#list-versions)
  * [Check Current Version](./#check-current-version)
  * [.yvmrc File](./#.yvmrc-file)
* [Contributing](./#contributing)
* [Copyright](./#copyright)

## Installation

### Install via Git

Clone this repo and run `make install`. This will create the `.yvm` directory in your home directory and copy the required files. It will also add a symlink to yvm in `/usr/local/bin`.

### Install via cURL

Execute the following in your terminal:

```text
curl https://github.com/tophatmonocle/yvm/blob/master/install.sh | bash
```

## Usage

### Basic

To download and install a version of yarn, run:

```text
yvm install <version>
```

And then in any new shell, just use the installed version:

```text
yvm use <version>
```

Or you can execute an arbitrary command using a specific version of yarn:

```text
yvm exec <version> <command>
```

### List Versions

```text
yvm list
```

### Check Current Version

```text
yvm which
```

### .yvmrc File

You can create a `.yvmrc` file containing the version number of yarn in your project's root directory. Afterwards, `yvm use`, `yvm install` and `yvm exec` will use the version specified in the `.yvmrc` file if no version number is supplied to the command.

## Contributing

Thanks goes to these wonderful people ([emoji key][emojis]):

dd

We welcome contributions from the community, Top Hatters and non-Top Hatters alike. Check out our [contributing guidelines](https://github.com/tophatmonocle/yvm/tree/ecf7c68e1dc3a3ced1ec23d17ca39e4ba70816d9/contributing.md) for more details.



## Copyright

© 2018 Tophatmonocle Corp


[deps]: https://david-dm.org/tophatmonocle/yvm/status.svg
[deps-url]: https://david-dm.org/tophatmonocle/yvm

[dev-deps]: https://david-dm.org/tophatmonocle/yvm/dev-status.svg
[dev-deps-url]: https://david-dm.org/tophatmonocle/yvm?type=dev

[builds]: https://img.shields.io/circleci/project/github/tophatmonocle/yvm.svg
[builds-url]: https://circleci.com/gh/tophatmonocle/yvm

[emojis]: https://github.com/kentcdodds/all-contributors#emoji-key

