#!/bin/sh

function yvm
    set command $argv[1]
    set -q YVM_DIR; or set -U YVM_DIR "$HOME/.yvm"

    function yvm_use
        set PROVIDED_VERSION $argv[1]
        set NEW_PATH (yvm_call_node_script get-new-path $PROVIDED_VERSION $fish_user_paths | tr ':' \n)
        if [ -z "$NEW_PATH" ]
            yvm_err "Could not get new path from yvm"
        else
            set -U fish_user_paths $NEW_PATH
            set -l new_version (yarn --version)
            yvm_echo "Now using yarn version $new_version"
        end
    end

    function yvm_echo
        command printf "%s\n" $argv 2>/dev/null
    end

    function yvm_err
        yvm_echo "$argv" >&2
    end

    function yvm_call_node_script
        # do not add anything that outputs stuff to stdout in function, its output is stored in a variable
        node "$YVM_DIR/yvm.js" $argv
    end

    if [ "$command" = "use" ]
        yvm_use $argv[2]
    else if [ "$command" = "update-self" ]
        curl -fsSL https://raw.githubusercontent.com/tophat/yvm/master/scripts/install.sh | YVM_INSTALL_DIR=${YVM_DIR} bash
    else
        yvm_call_node_script $argv[1..-1]
    end
end
