SHELL := /bin/bash
export PATH := $(shell npm bin):$(PATH)

.PHONY: install
install:
	@use_local=true ./install.sh

node_modules:
	npm install

.PHONY: yvm-test
yvm-test:
	@yvm
	echo $$-
	echo $$PS1

.PHONY: lint
lint: node_modules
	echo $$PATH
	@eslint .

.PHONY: lint-fix
lint-fix: node_modules
	@eslint --fix .
