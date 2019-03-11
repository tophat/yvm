#!/bin/bash

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

source ~/.yvm/yvm.sh

testing "yvm exec version command"
yvm install 1.11.0
test1_output=$(yvm exec 1.11.0 --version)
if [[ ${test1_output} == "1.11.0" ]]; then
    pass
else
    fail ${test1_output}
fi

testing "yvm use"
yvm install 1.13.0
yvm use 1.13.0
test2_output=$(yvm exec --version)
if [[ ${test2_output} == "1.13.0" ]]; then
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
