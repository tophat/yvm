#!/bin/sh

source vars.sh

if [ "$dev" = true ]; then
    # temp for development
    rm -f ${sh_install_path}
    rm -r ${js_install_dir}
fi

mkdir -p ${js_install_dir}

if [ "$dev" = true ]; then
    # Temp until the project is open source, because you need to login to see the files
    cp ./yvm.sh ${sh_install_path}
    cp ./yvm.js ${js_install_path}
else
    yvm_sh_url="https://raw.githubusercontent.com/tophatmonocle/yvm/master/yvm.sh"
    yvm_js_url="https://raw.githubusercontent.com/tophatmonocle/yvm/master/yvm.js"

    curl -o ${sh_install_path} ${yvm_sh_url}
    curl -o ${js_install_path} ${yvm_js_url}
fi

chmod +x ${sh_install_path}