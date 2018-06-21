#!/bin/sh

command=$1
${YVM_DIR:="${HOME}/.yvm"}

yvm_use() {
    local PROVIDED_VERSION=${1-$(head -n 1 .yvmrc)}
    echo "called yvm use with version $PROVIDED_VERSION"

    if [ -z "${PROVIDED_VERSION}" ]; then
        yvm_err 'version is required'
        return 3
    fi

    if yvm_is_version_installed "$PROVIDED_VERSION"; then
        local YVM_VERSION_DIR
        YVM_VERSION_DIR="$(yvm_version_path "$PROVIDED_VERSION")"
        PATH="$(yvm_change_path "$PATH" "/bin" "$YVM_VERSION_DIR")"
    else
        yvm_err "N/A: version \"${PROVIDED_VERSION}\" is not yet installed."
        yvm_err ""
        yvm_err "You need to run \"yvm install ${PROVIDED_VERSION}\" to install it before using it."
        return 1
    fi
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


yvm_() {
    command=$1
    if [ "$command" = "use" ]; then
        yvm_use $2
    else
        node "${YVM_DIR}/yvm.js" $@
    fi
}

if [ -n "$PS1" ]; then
    yvm() {
        yvm_ $@
    }
else
    yvm_ $@
fi
