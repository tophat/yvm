#!/bin/sh
set -q YVM_DIR; or set -U YVM_DIR "$HOME/.yvm"

function yvm
    set command $argv[1]

    function yvm_use
        if test (count $argv) -gt 0
            set PROVIDED_VERSION $argv[1]
        end

        begin
            set NEW_FISH_USER_PATHS (yvm_call_node_script get-new-path --shell=fish $PROVIDED_VERSION)
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
        set -lx fish_user_paths $fish_user_paths
        node "$YVM_DIR/yvm.js" $argv
    end

    function yvm_init_fish
        if not type -q "node"
            yvm_err "%s\n" "YVM Could not automatically set yarn version."
            yvm_err "%s\n" "Please ensure your YVM env variables and sourcing are set below sourcing node/nvm in your fish config file"
            exit 1
        end

        set -U DEFAULT_YARN_VERSION (yvm_call_node_script get-default-version 2>/dev/null)
        if [ "x" != "x$DEFAULT_YARN_VERSION" ]
            yvm_use > /dev/null
        end
    end

    if [ "$command" = "use" ]
        if test (count $argv) -gt 1
            yvm_use $argv[2]
        else
            yvm_use
        end
    else if [ "$command" = "update-self" ]
        curl -fsSL https://raw.githubusercontent.com/tophat/yvm/master/scripts/install.sh | YVM_INSTALL_DIR=${YVM_DIR} bash
    else if [ "$command" = "init-fish" ]
        yvm_init_fish
    else
        yvm_call_node_script $argv[1..-1]
    end
end

yvm init-fish
