#!/bin/sh

${use_local:=false}

release_url=""
install_dir="$HOME/.yvm"
zip_install_path="${install_dir}/yvm.zip"
sh_install_path="${install_dir}/yvm.sh"
js_install_path="${install_dir}/yvm.js"

executable_alias_path="/usr/local/bin/yvm"
executable_source_string="source ${executable_alias_path}"

if [ "$use_local" = true ]; then
    rm ${executable_alias_path}
    rm -r ${install_dir}
fi

mkdir -p ${install_dir}

if [ "$use_local" = true ]; then
    cp yvm.sh yvm.js ${install_dir}
else
    curl -o ${zip_install_path} ${release_url}
    unzip ${zip_install_path} -d ${install_dir}
    rm ${zip_install_path}
fi

chmod +x ${sh_install_path}
ln -s ${sh_install_path} ${executable_alias_path}

if ! grep -q "${executable_source_string}" ~/.zshrc; then
    echo '' >> ~/.zshrc
    echo ${executable_source_string} >> ~/.zshrc
fi
