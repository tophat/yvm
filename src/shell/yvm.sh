#!/bin/sh
YVM_DIR=${YVM_DIR-"${HOME}/.yvm"}

yvm() {
    command=$1

    yvm_use() {
        local PROVIDED_VERSION=${1}
        NEW_PATH=$(yvm_call_node_script get-new-path ${PROVIDED_VERSION})
        if [ -z "${NEW_PATH}" ]; then
            yvm_err "Could not get new path from yvm"
            exit 1
        else
            PATH=${NEW_PATH}
            yvm_echo "Now using yarn version $(yarn --version)"
        fi
    }

    yvm_echo() {
        command printf %s\\n "$*" 2>/dev/null
    }

    yvm_err() {
        yvm_echo >&2 "$@"
    }

    yvm_call_node_script() {
        # do not add anything that outputs stuff to stdout in function, its output is stored in a variable
        node "${YVM_DIR}/yvm.js" $@
    }

    yvm_init_sh() {
        if ! type "node" >/dev/null; then
            yvm_err "YVM Could not find node executable."
            yvm_err "Please ensure your YVM env variables and sourcing are set below sourcing node/nvm in your .zshrc or .bashrc"
            exit 1
        fi
        export PATH="${YVM_DIR}/shim":$PATH
    }

    if [ "${command}" = "use" ]; then
        yvm_use $2
    elif [ "${command}" = "update-self" ]; then
        curl -fsSL https://raw.githubusercontent.com/tophat/yvm/master/scripts/install.js | YVM_INSTALL_DIR=${YVM_DIR} node
    elif [ "${command}" = "init-sh" ]; then
        yvm_init_sh
    else
        yvm_call_node_script $@
    fi
}

if [ -n "$*" ]; then
    yvm $@
else
    yvm init-sh
fi
