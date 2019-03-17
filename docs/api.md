---
id: api
title: API
---

## `install [version]`

Install the specified version of Yarn.

## `use [version]`

Activate the specified version of Yarn.

## `exec [version] [yarn commands...]`

Execute an arbitrary Yarn command using the specified version of Yarn.

## `list`

List the currently installed versions of Yarn.

## `list-remote`

List Yarn versions available to install.

## `which`

Display file path to a version of Yarn.

## `current`

Display the current version of Yarn.

## `uninstall [version]`

Uninstall the specified version of Yarn.

## `alias [pattern]`

Show a list of registered version aliases. These can be used in place of `[version]` anywhere.

## `alias [name] [version]`

Register a new alias that can be used. Used internally to refer to `latest`, `stable`, `system` etc.

## `update-self`

Updates yvm to the latest version.

## `help`

Show the help text.
