.PHONY: install
install:
	@use_local=true ./install.sh

.PHONY: node_modules
node_modules:
	npm install

.PHONY: yvm-test
yvm-test:
	@yvm
	echo $$-
	echo $$PS1

.PHONY: lint
lint: node_modules
	@node_modules/.bin/eslint .

.PHONY: lint-fix
lint-fix: node_modules
	@node_modules/.bin/eslint --fix .
