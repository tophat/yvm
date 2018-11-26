#!/bin/sh

function yvm
    set command $argv[1]
    set -q YVM_DIR; or set -U YVM_DIR "$HOME/.yvm"

    function yvm_use
        if test (count $argv) -gt 0
            set PROVIDED_VERSION $argv[1]
        end
        
        begin
            set NEW_FISH_USER_PATHS (yvm_call_node_script get-new-fish-user-path $PROVIDED_VERSION)
        end
        if [ -z "$NEW_FISH_USER_PATHS" ]
            yvm_err "Could not get new path from yvm"
        else
            set -U fish_user_paths $NEW_FISH_USER_PATHS
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
        set -lx fish_user_paths $fish_user_paths
        node "$YVM_DIR/yvm.js" $argv
    end

    if [ "$command" = "use" ]
        if test (count $argv) -gt 1 
            yvm_use $argv[2]
        else 
            yvm_use
        end
    else if [ "$command" = "update-self" ]
        curl -fsSL https://raw.githubusercontent.com/tophat/yvm/master/scripts/install.sh | YVM_INSTALL_DIR=${YVM_DIR} bash
    else
        yvm_call_node_script $argv[1..-1]
    end
end
