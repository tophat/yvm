#!/bin/sh

# temp for dev
dev=true

release_url=""
install_dir="$HOME/.yvm"
zip_install_path="${install_dir}/yvm.zip"
sh_install_path="${install_dir}/yvm.sh"
js_install_path="${install_dir}/yvm.js"

executable_alias_path="/usr/local/bin/yvm"

if [ "$dev" = true ]; then
    # temp for development
    rm -f ${executable_alias_path}
    rm -r ${install_dir}
fi

mkdir -p ${install_dir}

if [ "$dev" = true ]; then
    # Temp until the project is open source, because you need to login to see the files
    zip yvm.zip yvm.sh yvm.js
    mv yvm.zip ${install_dir}
else
    curl -o ${zip_install_path} ${release_url}
fi

unzip ${zip_install_path} -d ${install_dir}
rm ${zip_install_path}

chmod +x ${sh_install_path}
ln -s ${sh_install_path} ${executable_alias_path}

