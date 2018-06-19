#!/bin/sh

echo "running yvm script"

yvm_use() {
	version=${1-$(head -n 1 .yvmrc)}
	echo "called yvm use with version $version"
}

yvm_() {
    echo "running yvm_"
    command=$1
    if [ "$command" = "use" ]; then
        yvm_use $2
    else
        node ~/.yvm/yvm.js $@
    fi
}

if [ -n "$PS1" ]; then
    echo "This shell is interactive, declaring yvm function only"
    yvm() {
        echo "running yvm function"
        yvm_ $@
    }
else
    echo "This shell is not interactive, running yvm now"
    yvm_ $@
fi
