#!/usr/bin/env bash

CURRENT_DIR=$(pwd)

# Check if already watching
if test -L "${HOME}/.yvm/yvm.sh" || test -L "${HOME}/.yvm/yvm.js"
then
    echo "Unable to save existing files!"
    echo "Make sure you do not have install-watch already running."
    exit 1
fi

save_and_link_file() {
    echo "Saving+Linking ${1}"
    mv "${HOME}/.yvm/${1}" "${HOME}/.yvm/${1}.bak"
    ln -s ${CURRENT_DIR}/artifacts/webpack_build/${1} "${HOME}/.yvm/${1}"
    chmod +x "${HOME}/.yvm/${1}"
}

restore_file() {
    rm "${HOME}/.yvm/${1}"
    if [ -f "${HOME}/.yvm/${1}.bak" ]
    then
        mv "${HOME}/.yvm/${1}.bak" "${HOME}/.yvm/${1}"
        echo "Restored ${1}"
    fi
}

# Save and link files
save_and_link_file "yvm.sh"
save_and_link_file "yvm.js"
save_and_link_file "yvm-exec.js"

# Trap interrupt signal
int_trap() {
    echo "Stopped Webpack"
}
trap int_trap INT

# Start Webpack in watch mode
./node_modules/.bin/webpack --progress --config webpack/webpack.config.development.js --watch

# Clean up and recover
restore_file "yvm.sh"
restore_file "yvm.js"
restore_file "yvm-exec.js"
