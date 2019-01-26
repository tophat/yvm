#!/bin/sh

command=$1
YVM_DIR=${YVM_DIR-"${HOME}/.yvm"}
export_yvm_dir_string="export YVM_DIR=${YVM_DIR}"

yvm_use() {
    local PROVIDED_VERSION=${1}
    NEW_PATH=$(yvm_call_node_script get-new-path ${PROVIDED_VERSION})
    if [ -z "${NEW_PATH}" ]; then
        yvm_err "Could not get new path from yvm"
    else
        PATH=${NEW_PATH}
        yvm_echo "Now using yarn version $(yarn --version)"
    fi
}

yvm_echo() {
    command printf %s\\n "$*" 2>/dev/null
}

yvm_err() {
    >&2 yvm_echo "$@"
}

yvm_call_node_script() {
    # do not add anything that outputs stuff to stdout in function, its output is stored in a variable
    node "${YVM_DIR}/yvm.js" $@
}

case "$-" in
    *i*) interactive=1;;
    *) interactive=0;;
esac

yvm_() {
    mode=$1
    shift 1

    command=$1
    if [ "${command}" = "use" ]; then
        if [ "${mode}" = 'script' ]; then
            yvm_err '"yvm use" can only be used when yvm is a shell function, not a script. Did you forget to source yvm?'
            exit 1
        fi
        yvm_use $2
    elif [ "${command}" = "update-self" ]; then
        curl -fsSL https://raw.githubusercontent.com/tophat/yvm/master/scripts/install.sh | YVM_INSTALL_DIR=${YVM_DIR} bash
    else
        yvm_call_node_script $@
    fi
}

yvm() {
    yvm_ 'function' $@
}

if [ ${interactive} = 1 ]; then
    if ! type "node" > /dev/null; then
        yvm_err "YVM Could not find node executable."
        yvm_err "Please ensure your YVM env variables and sourcing are set below sourcing node/nvm in your .zshrc or .bashrc"
    fi
    DEFAULT_YARN_VERSION=$(yvm_call_node_script get-default-version 2>/dev/null)
    if [ "x" != "x${DEFAULT_YARN_VERSION}" ]; then
        yvm_use > /dev/null
    fi
elif [ -n "$*" ]; then
    yvm_ 'script' $@
fi
