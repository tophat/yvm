#!/usr/bin/env bash

set -euo pipefail

err_report() {
    echo "yvm failed to install, the command that failed was: https://github.com/tophat/yvm/blob/master/scripts/install.sh#L${1}"
}

trap 'err_report $LINENO' ERR

USE_LOCAL=${USE_LOCAL-false}

release_api_url="https://api.github.com/repos/tophat/yvm/releases/latest"

YVM_DIR=${YVM_INSTALL_DIR-"${HOME}/.yvm"}
zip_download_path="${YVM_DIR}/yvm.zip"
sh_install_path="${YVM_DIR}/yvm.sh"

export_yvm_dir_string="export YVM_DIR=${YVM_DIR}"
executable_source_string='[ -r $YVM_DIR/yvm.sh ] && source $YVM_DIR/yvm.sh'

mkdir -p ${YVM_DIR}

if [ "$USE_LOCAL" = true ]; then
    rm -f "${YVM_DIR}/yvm.sh" "${YVM_DIR}/yvm.js" "${YVM_DIR}/yvm-exec.js"
    rm -rf "${YVM_DIR}/node_modules"
    unzip -o -q artifacts/yvm.zip -d ${YVM_DIR}
    chmod +x ${YVM_DIR}/yvm.sh
else
    if [ -z "$VERSION_TAG" ]; then
        download_url="https://github.com/tophat/yvm/releases/download/${VERSION_TAG}/yvm.zip"
        version_tag=${VERSION_TAG}
    else
        echo "Querying github release API to determine latest version"
        release_api_contents=$(curl -s ${release_api_url} )
        download_url=$(
            echo ${release_api_contents} |
            node -e "var stdin = fs.readFileSync(0).toString(); var json = JSON.parse(stdin); console.log(json.assets[0].browser_download_url)"
        )
        version_tag=$(
            echo ${release_api_contents} |
            node -e "var stdin = fs.readFileSync(0).toString(); var json = JSON.parse(stdin); console.log(json.tag_name)"
        )
    fi

    echo "Installing Version: ${version_tag}"
    curl -s -L -o ${zip_download_path} ${download_url}
    rm -rf "${YVM_DIR}/node_modules"
    unzip -o -q ${zip_download_path} -d ${YVM_DIR}
    echo "{ \"version\": \"${version_tag}\" }" > "${YVM_DIR}/.version"
    rm ${zip_download_path}
fi

chmod +x ${sh_install_path}

added_newline=0
if ! grep -q "${export_yvm_dir_string}" ~/.zshrc; then
    echo '' >> ~/.zshrc
    echo ${export_yvm_dir_string} >> ~/.zshrc
    added_newline=1
fi

if ! grep -qF "${executable_source_string}" ~/.zshrc; then
    [ -z "${added_newline}" ] && echo '' >> ~/.zshrc
    echo ${executable_source_string} >> ~/.zshrc
fi

added_newline=0
if ! grep -q "${export_yvm_dir_string}" ~/.bashrc; then
    echo '' >> ~/.bashrc
    echo ${export_yvm_dir_string} >> ~/.bashrc
    added_newline=1
fi

if ! grep -qF "${executable_source_string}" ~/.bashrc; then
    [ -z "${added_newline}" ] && echo '' >> ~/.bashrc
    echo ${executable_source_string} >> ~/.bashrc
fi

echo "yvm successfully installed in ${YVM_DIR} as ${sh_install_path}"
echo "Open another terminal window to start using it, or type \"source ${sh_install_path}\""
