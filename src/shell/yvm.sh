#!/bin/sh
YVM_DIR=${YVM_DIR-"${HOME}/.yvm"}

yvm() {
    command=$1

    yvm_set_user_path() {
        export PATH=${1}
    }

    yvm_use() {
        local PROVIDED_VERSION=${1}
        NEW_PATH=$(yvm_call_node_script get-new-path ${PROVIDED_VERSION})
        if [ -z "${NEW_PATH}" ]; then
            yvm_err "Could not get new path from yvm"
            exit 1
        else
            yvm_set_user_path $NEW_PATH
            yvm_echo "Now using yarn version $(yarn --version)"
        fi
    }

    yvm_shim() {
        yvm_set_user_path "$PATH:$YVM_DIR/shim"
    }

    yvm_deactivate() {
        NEW_PATH=$(yvm_call_node_script get-old-path)
        if [ -z "${NEW_PATH}" ]; then
            yvm_err "Could not remove yvm from system path"
            exit 1
        else
            yvm_set_user_path $NEW_PATH
        fi
    }

    yvm_unload() {
        yvm_deactivate
        unset YVM_DIR
        unset -f yvm_set_user_path
        unset -f yvm_use
        unset -f yvm_shim
        unset -f yvm_deactivate
        unset -f yvm_unload
        unset -f yvm_err
        unset -f yvm_call_node_script
        unset -f yvm_init_sh
        unset -f yvm
        yvm_echo "YVM configuration unloaded from shell"
        unset -f yvm_echo
    }

    yvm_echo() {
        command printf %s\\n "$*" 2>/dev/null
    }

    yvm_err() {
        yvm_echo >&2 "$@"
    }

    yvm_call_node_script() {
        # do not add anything that outputs stuff to stdout in function, its output is stored in a variable
        export sh_user_paths=$PATH
        node "${YVM_DIR}/yvm.js" $@
    }

    yvm_init_sh() {
        if ! type "node" >/dev/null; then
            yvm_err "YVM Could not find node executable."
            yvm_err "Please ensure your YVM env variables and sourcing are set below sourcing node/nvm in your .zshrc or .bashrc"
            exit 1
        fi
        yvm_shim
    }

    if [ "${command}" = "use" ]; then
        yvm_use $2
    elif [ "${command}" = "update-self" ]; then
        curl -fsSL https://raw.githubusercontent.com/tophat/yvm/master/scripts/install.js | YVM_INSTALL_DIR=${YVM_DIR} node
    elif [ "${command}" = "init-sh" ]; then
        yvm_init_sh
    elif [ "${command}" = "shim" ]; then
        yvm_shim
        yvm_echo "Now shimming yarn"
    elif [ "${command}" = "deactivate" ]; then
        yvm_deactivate
        yvm_echo "YVM shim and yarn versions removed from PATH"
    elif [ "${command}" = "unload" ]; then
        yvm_unload
    else
        yvm_call_node_script $@
    fi
}

if [ -n "$*" ]; then
    yvm $@
else
    yvm init-sh
fi
