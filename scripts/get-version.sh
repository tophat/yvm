#!/bin/bash -e
# TODO: switch to semantic-release

GREEN='\033[0;32m'
NC='\033[0m' # No Color

step() {
    >&2 echo -e "${GREEN}>>> ${1}${NC}"
}

print() {
    >&2 echo "${1}"
}

print_capturable() {
    echo "${1}"
}


function vercomp () {
    if [[ $1 == $2 ]]
    then
        return 0
    fi
    local IFS=.
    local i ver1=($1) ver2=($2)
    # fill empty fields in ver1 with zeros
    for ((i=${#ver1[@]}; i<${#ver2[@]}; i++))
    do
        ver1[i]=0
    done
    for ((i=0; i<${#ver1[@]}; i++))
    do
        if [[ -z ${ver2[i]} ]]
        then
            # fill empty fields in ver2 with zeros
            ver2[i]=0
        fi
        if ((10#${ver1[i]} > 10#${ver2[i]}))
        then
            return 1
        fi
        if ((10#${ver1[i]} < 10#${ver2[i]}))
        then
            return 2
        fi
    done
    return 0
}

step "Determining version to publish..."

release_api_contents=$(curl --silent "https://XXXXXXXX.cloudfront.net/yvm-releases")
last_published_version=$(
    echo ${release_api_contents} |
    node -e "var stdin = fs.readFileSync(0).toString(); var json = JSON.parse(stdin); console.log(json.tag_name.substring(1));"
)

print "Last published version is $last_published_version"

packaged_version="$(jq '.version' --raw-output package.json)"
print "Version in package.json is $packaged_version"

new_version=$last_published_version
set +e
vercomp $packaged_version $last_published_version
if [ $? -eq 1 ]; then
    print 'Packaged version is greater. Taking packaged version'
    new_version=$packaged_version
fi
set -e

step "Incrementing version $new_version"
new_version="$(echo "${new_version%.*}.$((${new_version##*.}+1))")"
new_version_with_v="v$new_version"
print "New version with v is $new_version_with_v"
print "Version to publish is $new_version"

print_capturable $new_version
