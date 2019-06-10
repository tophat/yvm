#!/usr/bin/env fish
set -q YVM_DIR; or set -gx YVM_DIR "$HOME/.yvm"

function yvm
    set command $argv[1]

    function set_fish_user_paths
        set -gx fish_user_paths (string split ' ' -- $argv[1])
    end

    function yvm_use
        if test (count $argv) -gt 0
            set PROVIDED_VERSION $argv[1]
        end

        begin
            set NEW_FISH_USER_PATHS (yvm_call_node_script get-new-path --shell=fish $PROVIDED_VERSION)
        end
        if [ -z "$NEW_FISH_USER_PATHS" ]
            yvm_err "Could not get new path from yvm"
            exit 1
        else
            set_fish_user_paths $NEW_FISH_USER_PATHS
            set -l new_version (yarn --version)
            yvm_echo "Now using yarn version $new_version"
        end
    end

    function yvm_shim
        begin
            set NEW_FISH_USER_PATHS (yvm_call_node_script get-shim-path --shell=fish)
        end
        if [ -z "$NEW_FISH_USER_PATHS" ]
            yvm_err "Could not get shim path from yvm"
            exit 1
        else
            set_fish_user_paths $NEW_FISH_USER_PATHS
        end
    end

    function yvm_deactivate
        begin
            set NEW_FISH_USER_PATHS (yvm_call_node_script get-old-path --shell=fish)
        end
        if [ -z "$NEW_FISH_USER_PATHS" ]
            yvm_err "Could not remove yvm from system path"
            exit 1
        else
            set_fish_user_paths $NEW_FISH_USER_PATHS
        end
    end

    function yvm_unload
        yvm_deactivate
        set -e YVM_DIR
        functions -e set_fish_user_paths
        functions -e yvm_use
        functions -e yvm_shim
        functions -e yvm_deactivate
        functions -e yvm_unload
        functions -e yvm_err
        functions -e yvm_call_node_script
        functions -e yvm_init_sh
        functions -e yvm
        yvm_echo "YVM configuration unloaded from shell"
        functions -e yvm_echo
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

    function yvm_init_sh
        if not type -q "node"
            yvm_err "%s\n" "YVM Could not automatically set yarn version."
            yvm_err "%s\n" "Please ensure your YVM env variables and sourcing are set below sourcing node/nvm in your fish config file"
            exit 1
        end
        yvm_shim
    end

    if [ "$command" = "use" ]
        if test (count $argv) -gt 1
            yvm_use $argv[2]
        else
            yvm_use
        end
    else if [ "$command" = "update-self" ]
        env YVM_INSTALL_DIR=$YVM_DIR curl -fsSL https://raw.githubusercontent.com/tophat/yvm/master/scripts/install.js | node
    else if [ "$command" = "init-sh" ]
        yvm_init_sh
    else if [ "$command" = "shim" ]
        yvm_shim
        yvm_echo "Now shimming yarn"
    else if [ "$command" = "deactivate" ]
        yvm_deactivate
        yvm_echo "YVM shim and yarn versions removed from PATH"
    else if [ "$command" = "unload" ]
        yvm_unload
    else
        yvm_call_node_script $argv[1..-1]
    end
end

if count $argv >/dev/null
    yvm $argv
else
    yvm init-sh
end
