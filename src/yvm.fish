#!/bin/sh

function yvm
    set command $argv[1]
    set -q YVM_DIR; or set YVM_DIR "$HOME/.yvm"

    function yvm_use
        set PROVIDED_VERSION $argv[1]
        set NEW_PATH (yvm_call_node_script get-new-path $PROVIDED_VERSION)
        if [ -z "$NEW_PATH" ]
            yvm_err "Could not get new path from yvm"
        else
            set -U PATH $NEW_PATH
            yvm_echo "Now using yarn version (yarn --version)"
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

    set interactive 0
    for option in $argv
        switch "$option"
            case -i
                set interactive 1
            case \*
        end
    end

    function yvm_
        set mode $argv[1]
        set command $argv[2]

        if [ "$command" = "use" ]
            if [ "$mode" = 'script' ]
                yvm_err '"yvm use" can only be used when yvm is a shell function, not a script. Did you forget to source yvm?'
                # exit 1
            end
            yvm_use $argv[3]
        else if [ "$command" = "update-self" ]
            curl -fsSL https://raw.githubusercontent.com/tophat/yvm/master/scripts/install.sh | YVM_INSTALL_DIR=${YVM_DIR} bash
        else
            yvm_call_node_script $argv[2..-1]
        end
    end

    if [ $interactive = 1 ]
        function yvm
            yvm_ 'function' $argv[1..-1]
        end
    else
        yvm_ 'script' $argv[1..-1]
    end
end
