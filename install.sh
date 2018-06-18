#!/bin/sh

# temp for dev
dev=true

executable_alias_path="/usr/local/bin/yvm"

install_dir="$HOME/.yvm"
sh_install_path="${install_dir}/yvm.sh"
js_install_path="${install_dir}/yvm.js"

if [ "$dev" = true ]; then
    # temp for development
    rm -f ${executable_alias_path}
    rm -r ${install_dir}
fi

mkdir -p ${install_dir}

if [ ! "$dev" = true ]; then
    # get github release zip and extract
    release_url=""

    curl -o ./yvm.zip ${release_url}
    # unzip
fi

# Temp until the project is open source, because you need to login to see the files
cp ./yvm.sh ${sh_install_path}
cp ./yvm.js ${js_install_path}

chmod +x ${sh_install_path}
ln -s ${sh_install_path} ${executable_alias_path}

