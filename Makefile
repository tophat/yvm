SHELL := /bin/bash
CURRENT_DIR = $(shell pwd)

YVM_EXECUTABLE := $(HOME)/.yvm/yvm.sh
export PATH := $(shell $(YVM_EXECUTABLE) exec bin):$(PATH)

ARTIFACT_DIR?=artifacts
TEST_REPORTS_DIR?=$(ARTIFACT_DIR)/reports
BUILD_DIR?=$(ARTIFACT_DIR)/build

ifdef CI
    ESLINT_EXTRA_ARGS=--format junit --output-file $(TEST_REPORTS_DIR)/lint/eslint.junit.xml
    JEST_ENV_VARIABLES=JEST_SUITE_NAME=yvm JEST_JUNIT_OUTPUT=$(TEST_REPORTS_DIR)/tests/jest.junit.xml
    JEST_ARGS=--ci --maxWorkers=2 --reporters jest-junit
else
    ESLINT_EXTRA_ARGS=
    JEST_ENV_VARIABLES=
    JEST_ARGS=
endif

ESLINT_ARGS=--max-warnings 0 ${ESLINT_EXTRA_ARGS}
.PHONY: help
help:
	@echo "--------------------- Useful Commands for Development ----------------------"
	@echo "make help                            - show tasks you can run"
	@echo "make install                         - runs a set of scripts to ensure your environment is ready"
	@echo "make install-watch                   - runs install, and watches code for local development"
	@echo "make yvm-test                        - runs the yvm node app"
	@echo ""
	@echo "----------------------- Other Commands  -------------------------"
	@echo "make build                           - runs eslint"
	@echo "make lint                            - runs eslint"
	@echo "make lint-fix                        - runs eslint --fix"
	@echo "make test                            - runs the full test suite with jest"
	@echo "make test-coverage                   - creates a coverage report and opens it in your browser"


# ---- YVM Command Stuff ----

.PHONY: install
install: build
	@use_local=true scripts/install.sh

.PHONY: install-watch
install-watch: node_modules
	mkdir -p ${CURRENT_DIR}/artifacts/webpack_build/
	rm -rf ~/.yvm
	ln -s ${CURRENT_DIR}/artifacts/webpack_build/ ${HOME}/.yvm
	chmod +x ${HOME}/.yvm/yvm.sh
	webpack --progress --config webpack/webpack.config.dev.js --watch


# ---- Infrastructure for Test/Deploy ----

.PHONY: build
build: node_modules
	@webpack --progress --config webpack/webpack.config.base.js


.PHONY: build_and_deploy
build_and_deploy: node_modules
	@webpack --progress --config webpack/webpack.config.deploy.js


# -------------- Linting --------------


.PHONY: lint
lint: node_modules
	eslint $(ESLINT_ARGS) .

.PHONY: lint-fix
lint-fix: node_modules
	eslint $(ESLINT_ARGS) --fix .


# -------------- Testing --------------

.PHONY: test
test: node_modules
	${JEST_ENV_VARIABLES} jest ${JEST_ARGS}

.PHONY: test-watch
test-watch: node_modules
	${JEST_ENV_VARIABLES} jest ${JEST_ARGS} --watch

.PHONY: test-coverage
test-coverage: node_modules
	${JEST_ENV_VARIABLES} jest ${JEST_ARGS} --coverage
	codecov

.PHONY: test-snapshots
test-snapshots: node_modules
	${JEST_ENV_VARIABLES} jest ${JEST_ARGS} --updateSnapshot


# ----------------- Helpers ------------------

.PHONY: node_modules
node_modules:
	$(YVM_EXECUTABLE) exec install
	touch node_modules

.PHONY: clean
clean:
	rm -rf ${ARTIFACT_DIR}
	rm -f ~/.babel.json
	rm -rf node_modules

