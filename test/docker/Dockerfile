FROM ubuntu:18.04

RUN apt-get update && apt-get -yqq install curl unzip

SHELL ["bash", "--login", "-c"]

RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | PROFILE=~/.profile bash
RUN nvm install v10.15.3

RUN curl -fsSL https://raw.githubusercontent.com/tophat/yvm/v3.6.0/scripts/install.js | PROFILE=~/.profile INSTALL_VERSION="v3.6.0" node
RUN yvm use 1.13.0
