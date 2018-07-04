#!/usr/bin/env bash

CURRENT_DIR=$(pwd)

# Check if already watching
if test -L "${HOME}/.yvm/yvm.sh" || test -L "${HOME}/.yvm/yvm.js"
then
    echo "Unable to save existing files!"
    echo "Make sure you do not have install-watch already running."
    exit 1
fi

# Save existing files
echo "Saving yvm.sh, yvm.js, yvm-exec.js"
mv "${HOME}/.yvm/yvm.sh" "${HOME}/.yvm/yvm_save.sh"
mv "${HOME}/.yvm/yvm.js" "${HOME}/.yvm/yvm_save.js"
mv "${HOME}/.yvm/yvm-exec.js" "${HOME}/.yvm/yvm-exec_save.js"

# Link
ln -s ${CURRENT_DIR}/artifacts/webpack_build/yvm.sh "${HOME}/.yvm/yvm.sh"
ln -s ${CURRENT_DIR}/artifacts/webpack_build/yvm.js "${HOME}/.yvm/yvm.js"
ln -s ${CURRENT_DIR}/artifacts/webpack_build/yvm-exec.js "${HOME}/.yvm/yvm-exec.js"
chmod +x "${HOME}/.yvm/yvm.sh"

# Trap interrupt signal
int_trap() {
    echo "Stopped Webpack"
}
trap int_trap INT

# Start Webpack in watch mode
./node_modules/.bin/webpack --progress --config webpack/webpack.config.dev.js --watch

# Clean up
echo "Cleaning up"

rm "${HOME}/.yvm/yvm.sh"
rm "${HOME}/.yvm/yvm.js"
rm "${HOME}/.yvm/yvm-exec.js"

# Try to recover
if [ -f "${HOME}/.yvm/yvm_save.sh" ]
then
    mv "${HOME}/.yvm/yvm_save.sh" "${HOME}/.yvm/yvm.sh"
    echo "Restored yvm.sh"
fi

if [ -f "${HOME}/.yvm/yvm_save.js" ]
then
    mv "${HOME}/.yvm/yvm_save.js" "${HOME}/.yvm/yvm.js"
    echo "Restored yvm.js"
fi

if [ -f "${HOME}/.yvm/yvm-exec_save.js" ]
then
    mv "${HOME}/.yvm/yvm-exec_save.js" "${HOME}/.yvm/yvm-exec.js"
    echo "Restored yvm-exec.js"
fi
