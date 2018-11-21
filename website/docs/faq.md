---
id: faq
title: FAQ
---

## Why should I use yvm?

## How does yvm work?

## I get the message `You need to source yvm to use this command.`
This means you're running the yvm.js script directly and not the shell function.
Try opening another terminal window, or type `source /usr/local/bin/yvm`


## Declare yvm version in a confugration file. Where can I place my version number?
In `package.json` under the key `yvm` set it to your version number.
In any file using the correct format: `.yvmrc`, `.yvmrc.json`, `.yvmrc.yaml`, `.yvmrc.yml`, `.yvmrc.js`, `yvm.config.js`
The files will be searched in the current directory, and then up the tree.
