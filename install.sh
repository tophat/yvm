#!/bin/sh

release_url=""
install_dir="$HOME/.yvm"
zip_install_path="${install_dir}/yvm.zip"
sh_install_path="${install_dir}/yvm.sh"
js_install_path="${install_dir}/yvm.js"

executable_alias_path="/usr/local/bin/yvm"

if [ "$use_local" = true ]; then
    rm -f ${executable_alias_path}
    rm -r ${install_dir}
fi

mkdir -p ${install_dir}

if [ "$use_local" = true ]; then
    zip yvm.zip yvm.sh yvm.js
    mv yvm.zip ${install_dir}
else
    curl -o ${zip_install_path} ${release_url}
fi

unzip ${zip_install_path} -d ${install_dir}
rm ${zip_install_path}

chmod +x ${sh_install_path}
ln -s ${sh_install_path} ${executable_alias_path}

