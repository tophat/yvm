#!/bin/sh

command=$1
YVM_DIR=${YVM_DIR-"${HOME}/.yvm"}
export_yvm_dir_string="export YVM_DIR=${YVM_DIR}"

save_last_used_yarn_version() {
    yarn_version="${1}"
    if [ -z "$yarn_version" ]; then
        yarn_version="$(yarn --version)"
    fi

    if [ -z "$yarn_version" ]; then
        return
    fi
    
    if ! grep -q "LAST_USED_YARN_VERSION" ~/.zshrc; then
        sed -i '' 's/.*YVM_DIR.*/export LAST_USED_YARN_VERSION='"${yarn_version}"'\'$'\n&/g' ~/.zshrc
    else
        sed -i '' "s/LAST_USED_YARN_VERSION.*/LAST_USED_YARN_VERSION=${yarn_version}/" ~/.zshrc
    fi

    if ! grep -q "LAST_USED_YARN_VERSION" ~/.bash_profile; then
        sed -i '' 's/.*YVM_DIR.*/export LAST_USED_YARN_VERSION='"${yarn_version}"'\'$'\n&/g' ~/.bash_profile
    else
        sed -i '' "s/LAST_USED_YARN_VERSION.*/LAST_USED_YARN_VERSION=${yarn_version}/" ~/.bash_profile
    fi
}

yvm_use() {
    local PROVIDED_VERSION=${1}
    NEW_PATH=$(yvm_call_node_script get-new-path ${PROVIDED_VERSION})
    if [ -z "${NEW_PATH}" ]; then
        yvm_err "Could not get new path from yvm"
    else
        PATH=${NEW_PATH}
        YARN_VERSION="$(yarn --version)"
        CURRENT_GLOBAL_YARN_VERSION="${LAST_USED_YARN_VERSION:-}"
        yvm_echo "Now using yarn version $(yarn --version)"
        if [ ! -e .yvmrc ] && [ "$YARN_VERSION" != "$CURRENT_GLOBAL_YARN_VERSION" ]; then
            save_last_used_yarn_version ${1}
        fi
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
        if [ "${command}" = "install" ]; then
            yvm_use $2
        fi
    fi
}

if [ ${interactive} = 1 ]; then
    yvm() {
        yvm_ 'function' $@
    }
    last_used_yarn="${LAST_USED_YARN_VERSION:-}"
    if [ -z "$last_used_yarn" ]; then
        yvm_echo "No default yarn version set. Use yvm install <version> or yvm use <version> to fix this"
    else
        if ! type "node" > /dev/null; then
            yvm_echo "YVM Could not automatically set yarn version."
            yvm_echo "Please ensure your YVM env variables and sourcing are set below sourcing node/nvm in your .zshrc or .bash_profile"
        else
            yvm_use ${last_used_yarn}
        fi
    fi
else
    yvm_ 'script' $@
fi
