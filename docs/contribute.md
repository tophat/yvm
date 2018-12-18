---
id: contribute
title: Contribute
---

We welcome contributions from the community, Top Hatters and non-Top Hatters alike. Here are some guidelines to help you get started!

## Basic development flow

1. Ensure the problem you are solving [is an issue](https://github.com/tophat/yvm/issues) or you've created one
1. Clone the repo
1. We use make. `make help` will show you a list of development commands
1. `make install-watch` will install yvm on your shell, update when you make changes, and automatically source yvm.sh. Make sure to only run this in the root yvm directory. It will fail elsewhere.
1. `make test` and `make lint` are also commonly helpful

Make sure all changes are well documented. Our documentation can be found inside the `docs` section of this repo. Be sure to read it carefully and make modifications wherever necessary. 
You can also access the documentation on our [website](https://yvm.js.org)


### Manual testing command contributions

```bash
make install
yvm <your-command-here>
```
