#!/bin/sh

command=$1
YVM_DIR="${HOME}/.yvm" #this can be exported globally during install?


yvm_use() {
	local PROVIDED_VERSION=$1
	echo "called yvm use with version $PROVIDED_VERSION"
	echo "path is $(yvm_version_path $PROVIDED_VERSION)"

	#change path


    local YVM_VERSION_DIR
    YVM_VERSION_DIR="$(yvm_version_path "$PROVIDED_VERSION")"
    echo "YVM_VERSION_DIR: $YVM_VERSION_DIR"
    
	      # Change current version
	echo "current $PATH"
	PATH="$(yvm_change_path "$PATH" "/bin" "$YVM_VERSION_DIR")"

	#export PATH
	echo "new $PATH"

	

}

yvm_version_path() {
  local VERSION
  VERSION="${1-}"
  if [ -z "${VERSION}" ]; then
    yvm_err 'version is required'
    return 3
  else yvm_echo "$(yvm_version_dir)/${VERSION}"
  fi
}

yvm_echo() {
  command printf %s\\n "$*" 2>/dev/null
}

yvm_cd() {
  # shellcheck disable=SC1001,SC2164
  \cd "$@"
}

yvm_err() {
  >&2 yvm_echo "$@"
}

yvm_version_dir() {
  local YVM_WHICH_DIR
  YVM_WHICH_DIR="${1-}"
  if [ -z "${YVM_WHICH_DIR}" ]; then
    yvm_echo "${YVM_DIR}/versions/yarn"
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
  # if the initial path doesn’t contain an nvm path, prepend the supplementary
  # path
  elif ! yvm_echo "${1-}" | yvm_grep -q "${YVM_DIR}/[^/]*${2-}" \
    && ! yvm_echo "${1-}" | yvm_grep -q "${YVM_DIR}/versions/[^/]*/[^/]*${2-}"; then
    yvm_echo "${3-}${2-}:${1-}"
  # if the initial path contains BOTH an nvm path (checked for above) and
  # that nvm path is preceded by a system binary path, just prepend the
  # supplementary path instead of replacing it.
  # https://github.com/creationix/nvm/issues/1652#issuecomment-342571223
  elif yvm_echo "${1-}" | yvm_grep -Eq "(^|:)(/usr(/local)?)?${2-}:.*${YVM_DIR}/[^/]*${2-}" \
    || yvm_echo "${1-}" | yvm_grep -Eq "(^|:)(/usr(/local)?)?${2-}:.*${YVM_DIR}/versions/[^/]*/[^/]*${2-}"; then
    yvm_echo "${3-}${2-}:${1-}"
  # use sed to replace the existing nvm path with the supplementary path. This
  # preserves the order of the path.
  else
    yvm_echo "${1-}" | command sed \
      -e "s#${YVM_DIR}/[^/]*${2-}[^:]*#${3-}${2-}#" \
      -e "s#${YVM_DIR}/versions/[^/]*/[^/]*${2-}[^:]*#${3-}${2-}#"
  fi
}



if [ "$command" = "use" ]; then
	yvm_use $2
else
	node yvm.js $@
fi
