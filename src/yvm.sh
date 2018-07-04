#!/bin/sh

command=$1
YVM_DIR=${YVM_DIR-"${HOME}/.yvm"}

yvm_use() {
    local PROVIDED_VERSION=${1-$(head -n 1 .yvmrc)}

    if [ -z "${PROVIDED_VERSION}" ]; then
        yvm_err 'version is required'
        return 3
    fi

    if ! yvm_is_version_installed "$PROVIDED_VERSION"; then
        yvm_ 'function' install ${PROVIDED_VERSION}
    fi

    local YVM_VERSION_DIR
    YVM_VERSION_DIR="$(yvm_version_path "$PROVIDED_VERSION")"
    PATH="$(yvm_change_path "$PATH" "/bin" "$YVM_VERSION_DIR")"
    echo "Set yarn version to ${PROVIDED_VERSION}"
}

yvm_is_version_installed() {
    [ -n "${1-}" ] && [ -x "$(yvm_version_path "$1" 2> /dev/null)"/bin/yarn ]
}

yvm_version_path() {
    local VERSION
    VERSION="${1-}"
    if [ -z "${VERSION}" ]; then
        yvm_err 'version is required'
        return 3
    else yvm_echo "$(yvm_version_dir)/v${VERSION}"
    fi
}

yvm_echo() {
    command printf %s\\n "$*" 2>/dev/null
}

yvm_err() {
    >&2 yvm_echo "$@"
}

yvm_version_dir() {
    local YVM_WHICH_DIR
    YVM_WHICH_DIR="${1-}"
    if [ -z "${YVM_WHICH_DIR}" ]; then
        yvm_echo "${YVM_DIR}/versions"
    else
        yvm_err 'unknown version dir'
        return 3
    fi
}

yvm_grep() {
    GREP_OPTIONS='' command grep "$@"
}

yvm_change_path() {
    # if there’s no initial path, just return the supplementary path
    if [ -z "${1-}" ]; then
        yvm_echo "${3-}${2-}"
    # if the initial path doesn’t contain an yvm path, prepend the supplementary
    # path
elif ! yvm_echo "${1-}" | yvm_grep -q "${YVM_DIR}/versions/[^/]*${2-}"; then
    yvm_echo "${3-}${2-}:${1-}"
    # use sed to replace the existing yvm path with the supplementary path. This
    # preserves the order of the path.
else
    yvm_echo "${1-}" | command sed \
    -e "s#${YVM_DIR}/versions/[^/]*${2-}[^:]*#${3-}${2-}#"
fi
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
        curl https://raw.githubusercontent.com/tophatmonocle/yvm/master/scripts/install.sh | YVM_INSTALL_DIR=${YVM_DIR} bash
    else
        node "${YVM_DIR}/yvm.js" $@
    fi
}

if [ ${interactive} = 1 ]; then
    yvm() {
        yvm_ 'function' $@
    }
else
    yvm_ 'script' $@
fi
