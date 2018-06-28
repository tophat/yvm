#!/usr/bin/env bash

set -euo pipefail

err_report() {
    echo "yvm failed to install, the command that failed was: https://github.com/tophatmonocle/yvm/blob/master/scripts/install.sh#L${1}"
}

trap 'err_report $LINENO' ERR

use_local=${use_local-false}

release_api_url="https://api.github.com/repos/tophatmonocle/yvm/releases/latest"
artifacts_dir="artifacts/webpack_build"

YVM_DIR=${YVM_INSTALL_DIR-"${HOME}/.yvm"}
zip_download_path="${YVM_DIR}/yvm.zip"
sh_install_path="${YVM_DIR}/yvm.sh"

YVM_ALIAS_DIR=${YVM_ALIAS_DIR-"/usr/local/bin"}
executable_alias_path="${YVM_ALIAS_DIR}/yvm"
export_yvm_dir_string="export YVM_DIR=${YVM_DIR}"
executable_source_string="source ${executable_alias_path}"

rm -f ${executable_alias_path}
mkdir -p ${YVM_DIR}
mkdir -p ${YVM_ALIAS_DIR}

if [ "$use_local" = true ]; then
    rm -f "${YVM_DIR}/yvm.sh" "${YVM_DIR}/yvm.js"
    cp "${artifacts_dir}/yvm.sh" "${artifacts_dir}/yvm.js" ${YVM_DIR}
else
    download_url=$(
        curl -s ${release_api_url} |
        grep '"browser_download_url": ".*/yvm.zip"' |
        sed 's/"browser_download_url"://g' |
        sed 's/[ "]//g'
    )
    curl -s -L -o ${zip_download_path} ${download_url}
    unzip -o -q ${zip_download_path} -d ${YVM_DIR}
    rm ${zip_download_path}
fi

chmod +x ${sh_install_path}
ln -s ${sh_install_path} ${executable_alias_path}

added_newline=0
if ! grep -q "${export_yvm_dir_string}" ~/.zshrc; then
    echo '' >> ~/.zshrc
    echo ${export_yvm_dir_string} >> ~/.zshrc
    added_newline=1
fi

if ! grep -q "${executable_source_string}" ~/.zshrc; then
    [ -z "${added_newline}" ] && echo '' >> ~/.zshrc
    echo ${executable_source_string} >> ~/.zshrc
fi

added_newline=0
if ! grep -q "${export_yvm_dir_string}" ~/.bash_profile; then
    echo '' >> ~/.bash_profile
    echo ${export_yvm_dir_string} >> ~/.bash_profile
    added_newline=1
fi

if ! grep -q "${executable_source_string}" ~/.bash_profile; then
    [ -z "${added_newline}" ] && echo '' >> ~/.bash_profile
    echo ${executable_source_string} >> ~/.bash_profile
fi

echo "yvm successfully installed in ${YVM_DIR} with the 'yvm' command aliased as ${executable_alias_path}"
echo "Open another terminal window to start using it, or type \"source /usr/local/bin/yvm\""
