.PHONY: install
install:
	@use_local=true ./install.sh

.PHONY: yvm-test
yvm-test:
	@yvm
	echo $$-
	echo $$PS1
