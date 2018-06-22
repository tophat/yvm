#!/usr/bin/env bash

CURRENT_DIR=$(pwd)

# Need to delete files, otherwise links are not created
rm ${HOME}/.yvm/yvm.sh
rm ${HOME}/.yvm/yvm.js

# Link
ln -s ${CURRENT_DIR}/artifacts/webpack_build/yvm.sh ${HOME}/.yvm/yvm.sh
ln -s ${CURRENT_DIR}/artifacts/webpack_build/yvm.js ${HOME}/.yvm/yvm.js
chmod +x ${HOME}/.yvm/yvm.sh

# Start Webpack in watch mode
webpack --progress --config webpack/webpack.config.dev.js --watch
