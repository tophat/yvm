.PHONY: build
build:
	@node_modules/.bin/webpack

.PHONY: install
install: build
	@use_local=true ./install.sh

.PHONY: yvm-test
yvm-test:
	@yvm
	echo $$-
	echo $$PS1
