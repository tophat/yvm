---
id: api
title: API
---

yvm cli docs following the header format;
`command_name|alt_name <required_param> [optional_param]`

## `install|i [version] [--verify]`

Install the specified version of Yarn. Will install the version of yarn found in the directory config if none is supplied.

### --verify

This forces a strict verification on the file signature. Any warnings from expired or invalid keys will cause the installation to fail

## `use [version]`

Activate the specified version of Yarn. This will stop yarn auto shimming until a new terminal is launched.

## `exec [version] [yarn commands...]`

Execute an arbitrary Yarn command using the specified version of Yarn.

## `list|ls`

List the currently installed versions of Yarn.

## `list-remote|ls-remote`

List Yarn versions available to install.

## `which [version]`

Display file path to a version of Yarn.

## `current`

Display the current version of Yarn.

## `uninstall|rm <version>`

Uninstall the specified version of Yarn.

## `alias [pattern]`

Show a list of registered version aliases. These can be used in place of `[version]`.

## `alias <name> <version>`

Register a new alias that can be used. Used internally to refer to `default`, `latest`, `stable` etc.

## `update-self`

Updates yvm to the latest version.

## `help`

Show the help text.
