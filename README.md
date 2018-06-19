# Yarn Version Manager

## Table of Contents

- [Installation](#installation)
    - [Install via Git](#install-via-git)
    - [Install via cURL](#install-via-curl)
- [Usage](#usage)
    - [Basic](#basic)
    - [List Versions](#list-versions)
    - [Check Current Version](#check-current-version)
    - [.yvmrc File](#.yvmrc-file)
- [Contributing](#contributing)
- [Copyright](#copyright)

## Installation

### Install via Git

Clone this repo and run `make install`. This will create the `.yvm` directory in your home directory and copy the required files. It will also add a symlink to yvm in `/usr/local/bin`.

### Install via cURL

Execute the following in your terminal:

```
curl https://github.com/tophatmonocle/yvm/blob/master/install.sh | bash
```

## Usage

### Basic

To download and install a version of yarn, run:

```
yvm install <version>
```

And then in any new shell, just use the installed version:

```
yvm use <version>
```

Or you can execute an arbitrary command using a specific version of yarn:

```
yvm exec <version> <command>
```

### List Versions

```
yvm list
```

### Check Current Version

```
yvm which
```

### .yvmrc File

You can create a `.yvmrc` file containing the version number of yarn in your project's root directory. Afterwards, `yvm use`, `yvm install` and `yvm exec` will use the version specified in the `.yvmrc` file if no version number is supplied to the command.


## Contributing

We welcome contributions from the community, Top Hatters and non-Top Hatters alike. Check out our [contributing guidelines]() for more details.


## Copyright

&copy; 2018 Tophatmonocle Corp
