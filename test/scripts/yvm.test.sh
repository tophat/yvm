#!/usr/bin/env bash

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

testing() {
    echo
    echo
    echo -e "${GREEN}>>> ${1}${NC}"
}

pass() {
    echo -e "${GREEN} PASSED! ${NC}"
}

fail() {
    echo -e "${RED} TEST FAILED! ${NC}"
    echo "Test output::"
    echo ${1}
    exit 1
}

testing "yvm default options"
~/.yvm/yvm.sh --version
if [[ $? -eq 0 ]]; then
    pass
else
    fail "yvm --version non zero exit"
fi

~/.yvm/yvm.sh --help
if [[ $? -eq 0 ]]; then
    pass
else
    fail "yvm --help non zero exit"
fi

testing "yvm set default version"
~/.yvm/yvm.sh set-default 1.12.0
source ~/.yvm/yvm.sh

testing "yvm exec alias version"
test0_output=$(yvm exec default --version)
if [[ ${test0_output} == "1.12.0" ]]; then
    pass
else
    fail ${test0_output}
fi

testing "yvm install version"
yvm install 1.11.0
testing "yvm exec version command"
test1_output=$(yvm exec 1.11.0 --version)
if [[ ${test1_output} == "1.11.0" ]]; then
    pass
else
    fail ${test1_output}
fi

testing "yarn shimmed config"
test_shim_config_output=$(yarn --version)
if [[ ${test_shim_config_output} == "1.22.0" ]]; then
    pass
else
    fail ${test_shim_config_output}
fi

testing "yvm use"
yvm install 1.13.0
yvm use 1.13.0
test2_output=$(yvm exec --version)
if [[ ${test2_output} == "1.22.0" ]]; then
    pass
else
    fail ${test2_output}
fi

testing "yvm use set yarn"
test3_output=$(yarn --version)
if [[ ${test3_output} == "1.13.0" ]]; then
    pass
else
    fail ${test3_output}
fi

testing "yvm uninstall version"
yvm uninstall 1.11.0
if [[ $? -eq 0 ]]; then
    pass
else
    fail "yvm uninstall 1.11.0 failed"
fi

testing "yvm uninstall alias version"
yvm uninstall default
if [[ $? -eq 0 ]]; then
    pass
else
    fail "yvm uninstall default failed"
fi

testing "yvm current command"
test4_output=$(yvm current)
if [[ $test4_output == "1.13.0" ]]; then
    pass
else
    fail "yvm current command failed: $test4_output"
fi
