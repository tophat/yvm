# Changelog

All notable changes to this project will be documented in this file.

The format is somewhat based on [Keep a Changelog](https://keepachangelog.com),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased](https://github.com/tophat/yvm/pulls)

* unload yvm from PATH command
* unload yvm from shell command

## [v3.2.1](https://github.com/tophat/yvm/compare/v3.2.0...v3.2.1) (2019-04-14)

* **Fixed**: use yarn latest version link ([#365](https://github.com/tophat/yvm/issues/365)) ([b9ba1ba](https://github.com/tophat/yvm/commit/b9ba1ba))

## [v3.2.0](https://github.com/tophat/yvm/compare/v3.0.1...v3.0.2) (2019-04-12)

* **Added**: shim yarn commands ([#163](https://github.com/tophat/yvm/issues/163)) ([28b9f42](https://github.com/tophat/yvm/commit/28b9f42))

## [v3.1.0](https://github.com/tophat/yvm/compare/v3.0.1...v3.0.2) (2019-04-09)

* **Added**: configure shell command ([#358](https://github.com/tophat/yvm/issues/358)) ([d89c48b](https://github.com/tophat/yvm/commit/d89c48b))

## [v3.0.3](https://github.com/tophat/yvm/compare/v3.0.1...v3.0.2) (2019-04-08)

* **Fixed**: prepend yvm yarn version to path only once ([#357](https://github.com/tophat/yvm/issues/357)) ([e7dcec8](https://github.com/tophat/yvm/commit/e7dcec8))

## [v3.0.2](https://github.com/tophat/yvm/compare/v3.0.1...v3.0.2) (2019-04-06)

* **Fixed**: use correct fish_user_paths env variable ([#356](https://github.com/tophat/yvm/issues/356)) ([033b460](https://github.com/tophat/yvm/commit/033b460))

## [v3.0.1](https://github.com/tophat/yvm/compare/v3.0.0...v3.0.1) (2019-04-06)

* **Fixed**: commands break inelegantly without internet connection ([#352](https://github.com/tophat/yvm/issues/352)) ([1f5d73b](https://github.com/tophat/yvm/commit/1f5d73b))

## [v3.0.0](https://github.com/tophat/yvm/compare/v2.4.3...v3.0.0) (2019-03-22)

* **Added**: current command replacing which ([#328](https://github.com/tophat/yvm/issues/328)) ([083c88a](https://github.com/tophat/yvm/commit/083c88a))
* **Added**: uninstall command replacing remove ([#328](https://github.com/tophat/yvm/issues/328)) ([083c88a](https://github.com/tophat/yvm/commit/083c88a))
* **Added**: support for version aliasing ([#323](https://github.com/tophat/yvm/issues/323)) ([083c88a](https://github.com/tophat/yvm/commit/083c88a))
* **Changed**: default to stable on first install ([#261](https://github.com/tophat/yvm/issues/261)) ([083c88a](https://github.com/tophat/yvm/commit/083c88a))
* **Deprecated**: version command ([#323](https://github.com/tophat/yvm/issues/323)) ([083c88a](https://github.com/tophat/yvm/commit/083c88a))
* **Deprecated**: remove command ([#323](https://github.com/tophat/yvm/issues/323)) ([083c88a](https://github.com/tophat/yvm/commit/083c88a))
* **Deprecated**: set-default command ([#323](https://github.com/tophat/yvm/issues/323)) ([083c88a](https://github.com/tophat/yvm/commit/083c88a))
* **Deprecated**: get-default-version command ([#323](https://github.com/tophat/yvm/issues/323)) ([083c88a](https://github.com/tophat/yvm/commit/083c88a))

which command now outputs path to yarn not version in use

## [v2.4.3](https://github.com/tophat/yvm/compare/v2.4.2...v2.4.3) (2019-03-14)

* **Fixed**: restore yvm.sh as executable functionality ([c9ab90b](https://github.com/tophat/yvm/commit/c9ab90b))

## [v2.4.2](https://github.com/tophat/yvm/compare/v2.4.1...v2.4.2) (2019-03-10)

* **Fixed**: init yvm function in non interactive shell ([#318](https://github.com/tophat/yvm/issues/318)) ([9fe3e2f](https://github.com/tophat/yvm/commit/9fe3e2f))

## [v2.4.1](https://github.com/tophat/yvm/compare/v2.4.0...v2.4.1) (2019-03-10)

* **Fixed**: do not show yvm version error ([#320](https://github.com/tophat/yvm/issues/320)) ([3f8c251](https://github.com/tophat/yvm/commit/3f8c251))

## [v2.4.0](https://github.com/tophat/yvm/compare/v2.3.0...v2.4.0) (2019-02-21)

* **Added**: support for yarn engine config in package json ([#307](https://github.com/tophat/yvm/issues/307)) ([de9aa10](https://github.com/tophat/yvm/commit/de9aa10))

## [v2.3.0](https://github.com/tophat/yvm/compare/v2.2.0...v2.3.0) (2019-02-11)

* **Added**: fish shell support ([#273](https://github.com/tophat/yvm/issues/273)) ([b58057a](https://github.com/tophat/yvm/commit/b58057a))
* **Fixed**: print versions ([#296](https://github.com/tophat/yvm/issues/296)) ([2c662a8](https://github.com/tophat/yvm/commit/2c662a8))

## [v2.1.0](https://github.com/tophat/yvm/compare/v2.0.0...v2.1.0) (2019-01-23)

* **Added**: support for semantic version config ([#291](https://github.com/tophat/yvm/issues/291)) ([dc1fe01](https://github.com/tophat/yvm/commit/dc1fe01))

## [v2.0.0](https://github.com/tophat/yvm/compare/v1.1.0...v2.0.0) (2019-01-22)

* **Added**: commitizen 🎸 ([#295](https://github.com/tophat/yvm/issues/295)) ([567ab93](https://github.com/tophat/yvm/commit/567ab93))
* **Changed**: bumped minimum node version
  
Minimum node version is now 8.0

## [v1.1.0](https://github.com/tophat/yvm/compare/v1.0.11...v1.1.0) (2019-01-22)

* **Added**: publish yvm.zip as asset ([f5ebf80](https://github.com/tophat/yvm/commit/f5ebf80))
* **Fixed**: ensure release publishes correctly for install ([6255ee3](https://github.com/tophat/yvm/commit/6255ee3))
* **Fixed**: allow yvm to take stdio input ([#290](https://github.com/tophat/yvm/issues/290)) ([85e97e3](https://github.com/tophat/yvm/commit/85e97e3))

## [v1.0.1](https://github.com/tophat/yvm/compare/v0.9.31...v1.0.1) (2018-12-23)

* **Added**: gpg validation, to ensure yarn versions downloaded via mirrors have not been tampered with.
