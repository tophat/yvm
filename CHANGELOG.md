## [4.1.4](https://github.com/tophat/yvm/compare/v4.1.3...v4.1.4) (2021-03-13)


### Bug Fixes

* **install:** update targz lib to fix crash extracting versions ([#951](https://github.com/tophat/yvm/issues/951)) ([79e8a6e](https://github.com/tophat/yvm/commit/79e8a6ef1074acbcfe976823f6637f8e5a102bb3))

## [4.1.3](https://github.com/tophat/yvm/compare/v4.1.2...v4.1.3) (2021-02-12)


### Bug Fixes

* bump dependencies ([#928](https://github.com/tophat/yvm/issues/928)) ([853622b](https://github.com/tophat/yvm/commit/853622b5cc8058c7de09348f7bb22282d5b532b3))

## [4.1.2](https://github.com/tophat/yvm/compare/v4.1.1...v4.1.2) (2021-02-12)


### Bug Fixes

* exception when reading yvm config fails, close [#926](https://github.com/tophat/yvm/issues/926) ([#927](https://github.com/tophat/yvm/issues/927)) ([d0be0af](https://github.com/tophat/yvm/commit/d0be0af164b4c0e46a1ca1625035035bf061ffe2))

## [4.1.1](https://github.com/tophat/yvm/compare/v4.1.0...v4.1.1) (2020-12-31)


### Bug Fixes

* release yvm with build assets ([#908](https://github.com/tophat/yvm/issues/908)) ([d990b7e](https://github.com/tophat/yvm/commit/d990b7e5382bf15968f65a854301b5e3d11c557b))

# [4.1.0](https://github.com/tophat/yvm/compare/v4.0.1...v4.1.0) (2020-12-31)


### Features

* add custom bootstrap script support, close [#900](https://github.com/tophat/yvm/issues/900) ([#901](https://github.com/tophat/yvm/issues/901)) ([70c831a](https://github.com/tophat/yvm/commit/70c831a2904cb16d71100d5f51d14d451d130da5))

## [4.0.1](https://github.com/tophat/yvm/compare/v4.0.0...v4.0.1) (2020-09-19)


### Bug Fixes

* do not expand variables before calling node script ([#775](https://github.com/tophat/yvm/issues/775)) ([04177ce](https://github.com/tophat/yvm/commit/04177ce1878a401403ce12f04150736a6253bd62))

# [4.0.0](https://github.com/tophat/yvm/compare/v3.6.7...v4.0.0) (2020-09-19)


### chore

* 🤖 drop support for node version <10 ([174bdf0](https://github.com/tophat/yvm/commit/174bdf0798e9ce6b1387abae2bfad3864d4bfe44))


### BREAKING CHANGES

* 🧨 Drops support for node version <10

## [3.6.7](https://github.com/tophat/yvm/compare/v3.6.6...v3.6.7) (2020-02-07)


### Bug Fixes

* prepend shell path with yvm shim ([#564](https://github.com/tophat/yvm/issues/564)) ([3ae969b](https://github.com/tophat/yvm/commit/3ae969b9a22711789ba31457117bd6ea852c3804))

## [3.6.6](https://github.com/tophat/yvm/compare/v3.6.5...v3.6.6) (2019-12-15)


### Bug Fixes

* check if yvm script exists in fish shell before sourcing ([#506](https://github.com/tophat/yvm/issues/506)) ([f567362](https://github.com/tophat/yvm/commit/f5673620c0804e7762cd3a190781634067d7ad45))

## [3.6.5](https://github.com/tophat/yvm/compare/v3.6.4...v3.6.5) (2019-12-15)


### Performance Improvements

* shim path from shell script only ([#501](https://github.com/tophat/yvm/issues/501)) ([c4aff5a](https://github.com/tophat/yvm/commit/c4aff5a49ae50fa57eff4036afb5a9818df1cdee))

## [3.6.4](https://github.com/tophat/yvm/compare/v3.6.3...v3.6.4) (2019-11-12)


### Bug Fixes

* check for semver satisfaction of yvm config ([#489](https://github.com/tophat/yvm/issues/489)) ([136d7bc](https://github.com/tophat/yvm/commit/136d7bc))
* use parent shell path in place of node process path ([#488](https://github.com/tophat/yvm/issues/488)) ([f83d5a8](https://github.com/tophat/yvm/commit/f83d5a8))

## [3.6.3](https://github.com/tophat/yvm/compare/v3.6.2...v3.6.3) (2019-11-12)


### Bug Fixes

* match version tags with v prefix in install script ([#487](https://github.com/tophat/yvm/issues/487)) ([ac9f45b](https://github.com/tophat/yvm/commit/ac9f45b))

## [3.6.2](https://github.com/tophat/yvm/compare/v3.6.1...v3.6.2) (2019-08-10)


### Bug Fixes

* pin install version in legacy shell install script ([#443](https://github.com/tophat/yvm/issues/443)) ([00ebfa7](https://github.com/tophat/yvm/commit/00ebfa7))

## [3.6.1](https://github.com/tophat/yvm/compare/v3.6.0...v3.6.1) (2019-07-30)


### Bug Fixes

* do not configure the custom profile for multiple shells ([#440](https://github.com/tophat/yvm/issues/440)) ([d616d43](https://github.com/tophat/yvm/commit/d616d43))

# [3.6.0](https://github.com/tophat/yvm/compare/v3.5.0...v3.6.0) (2019-07-30)


### Features

* support configurable shell profiles ([#439](https://github.com/tophat/yvm/issues/439)) ([bcfe8bb](https://github.com/tophat/yvm/commit/bcfe8bb))

# [3.5.0](https://github.com/tophat/yvm/compare/v3.4.0...v3.5.0) (2019-06-12)

### Features

* undo yvm effects on the shell commands ([#400](https://github.com/tophat/yvm/issues/400)) ([32a2ebc](https://github.com/tophat/yvm/commit/32a2ebc))

# [3.4.0](https://github.com/tophat/yvm/compare/v3.3.0...v3.4.0) (2019-05-25) 🎉

### Features

* bundle all of yvm into a single release file `yvm.js` ([#368](https://github.com/tophat/yvm/issues/368)) ([2789af9](https://github.com/tophat/yvm/commit/2789af9))

# [3.3.0](https://github.com/tophat/yvm/compare/v3.2.3...v3.3.0) (2019-05-17)

### Features

* update current command to return only version string ([#392](https://github.com/tophat/yvm/issues/392)) ([8ba8c5b](https://github.com/tophat/yvm/commit/8ba8c5b))

## [3.2.3](https://github.com/tophat/yvm/compare/v3.2.2...v3.2.3) (2019-04-27)

### Bug Fixes

* replace fish universal variable with global export ([#381](https://github.com/tophat/yvm/issues/381)) ([27c1d2d](https://github.com/tophat/yvm/commit/27c1d2d))

## [3.2.2](https://github.com/tophat/yvm/compare/v3.2.1...v3.2.2) (2019-04-18)

### Bug Fixes

* install yarn verification ([#369](https://github.com/tophat/yvm/issues/369)) ([22a4e93](https://github.com/tophat/yvm/commit/22a4e93))

Added a `--verify` flag to the install command to force a failure if there're any verification issues.

## [3.2.1](https://github.com/tophat/yvm/compare/v3.2.0...v3.2.1) (2019-04-14)

### Bug Fixes

* use yarn latest version link ([#365](https://github.com/tophat/yvm/issues/365)) ([b9ba1ba](https://github.com/tophat/yvm/commit/b9ba1ba))

# [3.2.0](https://github.com/tophat/yvm/compare/v3.0.1...v3.0.2) (2019-04-12)

### Features

* shim yarn commands ([#163](https://github.com/tophat/yvm/issues/163)) ([28b9f42](https://github.com/tophat/yvm/commit/28b9f42))

## [3.1.0](https://github.com/tophat/yvm/compare/v3.0.1...v3.0.2) (2019-04-09)

### Features

* configure shell command ([#358](https://github.com/tophat/yvm/issues/358)) ([d89c48b](https://github.com/tophat/yvm/commit/d89c48b))

## [3.0.3](https://github.com/tophat/yvm/compare/v3.0.1...v3.0.2) (2019-04-08)

### Bug Fixes

* prepend yvm yarn version to path only once ([#357](https://github.com/tophat/yvm/issues/357)) ([e7dcec8](https://github.com/tophat/yvm/commit/e7dcec8))

## [3.0.2](https://github.com/tophat/yvm/compare/v3.0.1...v3.0.2) (2019-04-06)

### Bug Fixes

* use correct fish_user_paths env variable ([#356](https://github.com/tophat/yvm/issues/356)) ([033b460](https://github.com/tophat/yvm/commit/033b460))

## [3.0.1](https://github.com/tophat/yvm/compare/v3.0.0...v3.0.1) (2019-04-06) 🚀

### Bug Fixes

* commands break inelegantly without internet connection ([#352](https://github.com/tophat/yvm/issues/352)) ([1f5d73b](https://github.com/tophat/yvm/commit/1f5d73b))

# [3.0.0](https://github.com/tophat/yvm/compare/v2.4.3...v3.0.0) (2019-03-22)

### Features

* current command replacing which ([#328](https://github.com/tophat/yvm/issues/328)) ([083c88a](https://github.com/tophat/yvm/commit/083c88a))
* uninstall command replacing remove ([#328](https://github.com/tophat/yvm/issues/328)) ([083c88a](https://github.com/tophat/yvm/commit/083c88a))
* support for version aliasing ([#323](https://github.com/tophat/yvm/issues/323)) ([083c88a](https://github.com/tophat/yvm/commit/083c88a))
* **Changed**: default to stable on first install ([#261](https://github.com/tophat/yvm/issues/261)) ([083c88a](https://github.com/tophat/yvm/commit/083c88a))
* **Deprecated**: version command ([#323](https://github.com/tophat/yvm/issues/323)) ([083c88a](https://github.com/tophat/yvm/commit/083c88a))
* **Deprecated**: remove command ([#323](https://github.com/tophat/yvm/issues/323)) ([083c88a](https://github.com/tophat/yvm/commit/083c88a))
* **Deprecated**: set-default command ([#323](https://github.com/tophat/yvm/issues/323)) ([083c88a](https://github.com/tophat/yvm/commit/083c88a))
* **Deprecated**: get-default-version command ([#323](https://github.com/tophat/yvm/issues/323)) ([083c88a](https://github.com/tophat/yvm/commit/083c88a))

### Breaking Changes

* which command now outputs path to yarn not version in use

## [2.4.3](https://github.com/tophat/yvm/compare/v2.4.2...v2.4.3) (2019-03-14)

### Bug Fixes

* restore yvm.sh as executable functionality ([c9ab90b](https://github.com/tophat/yvm/commit/c9ab90b))

## [2.4.2](https://github.com/tophat/yvm/compare/v2.4.1...v2.4.2) (2019-03-10)

### Bug Fixes

* init yvm function in non interactive shell ([#318](https://github.com/tophat/yvm/issues/318)) ([9fe3e2f](https://github.com/tophat/yvm/commit/9fe3e2f))

## [2.4.1](https://github.com/tophat/yvm/compare/v2.4.0...v2.4.1) (2019-03-10)

### Bug Fixes

* do not show yvm version error ([#320](https://github.com/tophat/yvm/issues/320)) ([3f8c251](https://github.com/tophat/yvm/commit/3f8c251))

# [2.4.0](https://github.com/tophat/yvm/compare/v2.3.0...v2.4.0) (2019-02-21)

### Features

* support for yarn engine config in package json ([#307](https://github.com/tophat/yvm/issues/307)) ([de9aa10](https://github.com/tophat/yvm/commit/de9aa10))

# [2.3.0](https://github.com/tophat/yvm/compare/v2.2.0...v2.3.0) (2019-02-11) 🎣

### Bug Fixes

* print versions ([#296](https://github.com/tophat/yvm/issues/296)) ([2c662a8](https://github.com/tophat/yvm/commit/2c662a8))

### Features

* fish shell support ([#273](https://github.com/tophat/yvm/issues/273)) ([b58057a](https://github.com/tophat/yvm/commit/b58057a))

# [2.1.0](https://github.com/tophat/yvm/compare/v2.0.0...v2.1.0) (2019-01-23)

### Features

* support for semantic version config ([#291](https://github.com/tophat/yvm/issues/291)) ([dc1fe01](https://github.com/tophat/yvm/commit/dc1fe01))

# [2.0.0](https://github.com/tophat/yvm/compare/v1.1.0...v2.0.0) (2019-01-22)

### Features

* commitizen 🎸 ([#295](https://github.com/tophat/yvm/issues/295)) ([567ab93](https://github.com/tophat/yvm/commit/567ab93))

* bumped minimum node version

Minimum node version is now 8.0

# [1.1.0](https://github.com/tophat/yvm/compare/v1.0.1...v1.1.0) (2019-01-22)

### Bug Fixes

* ensure release publishes correctly for install ([6255ee3](https://github.com/tophat/yvm/commit/6255ee3))

* allow yvm to take stdio input ([#290](https://github.com/tophat/yvm/issues/290)) ([85e97e3](https://github.com/tophat/yvm/commit/85e97e3))

### Features

* publish yvm.zip as asset ([f5ebf80](https://github.com/tophat/yvm/commit/f5ebf80))

## [1.0.1](https://github.com/tophat/yvm/compare/v0.9.31...v1.0.1) (2018-12-23)

### Bug Fixes

* gpg validation, to ensure yarn versions downloaded via mirrors have not been tampered with.

## Changelog

All notable changes to this project will be documented in this file.

The format is somewhat based on [Keep a Changelog](https://keepachangelog.com),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [In Progress](https://github.com/tophat/yvm/pulls)

See open [issues](https://github.com/tophat/yvm/issues)
