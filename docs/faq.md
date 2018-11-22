---
id: faq
title: FAQ
---

## Why should I use yvm?
YVM will automaticaly select the correct version of yarn for you whenever you run any yarn commands. If there is a `.yvmrc` file, it will use that version. If no .yvmrc file exists, it will use a globally set default version. 

YVM also has many useful commands. Refer to the API documentation for more details.


## How does yvm work?
YVM is essentially a shim which will intercept yarn commands. It will determine the correct version of yarn, and append it to the path.
YVM has all installed versions of yarn in `.yvm/versions`.


## I get the message `You need to source yvm to use this command.`
This means you're running the yvm.js script directly and not the shell function.
Try opening another terminal window, or type `source /usr/local/bin/yvm`


## Declare yvm version in a confugration file. Where can I place my version number?
In `package.json` under the key `yvm` set it to your version number.
In any file using the correct format: `.yvmrc`, `.yvmrc.json`, `.yvmrc.yaml`, `.yvmrc.yml`, `.yvmrc.js`, `yvm.config.js`
The files will be searched in the current directory, and then up the tree.
