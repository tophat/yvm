ARTIFACT_DIR?=artifacts
TEST_REPORTS_DIR?=$(ARTIFACT_DIR)/reports
BUILD_DIR?=$(ARTIFACT_DIR)/build

ifdef CI
    ESLINT_EXTRA_ARGS=--format junit --output-file $(TEST_REPORTS_DIR)/lint/eslint.junit.xml
    JEST_ENV_VARIABLES=JEST_SUITE_NAME=yvm JEST_JUNIT_OUTPUT=$(TEST_REPORTS_DIR)/tests/jest.junit.xml
    JEST_ARGS=--ci --maxWorkers=2 --reporters jest-junit
    WEBPACK_ARGS=
else
    ESLINT_EXTRA_ARGS=
    JEST_ENV_VARIABLES=
    JEST_ARGS=
    WEBPACK_ARGS=--progress
endif

ESLINT_ARGS=--max-warnings 0 $(ESLINT_EXTRA_ARGS)
YVM_DIR?=$(HOME)/.yvm

NODE_MODULES_BIN := node_modules/.bin

CODECOV := $(NODE_MODULES_BIN)/codecov
ESLINT := $(NODE_MODULES_BIN)/eslint $(ESLINT_ARGS)
JEST := $(JEST_ENV_VARIABLES) $(NODE_MODULES_BIN)/jest $(JEST_ARGS)
WEBPACK := $(NODE_MODULES_BIN)/webpack $(WEBPACK_ARGS)
YVM := $(YVM_DIR)/yvm.sh

.PHONY: help
help:
	echo $(JEST)
	@echo "--------------------- Useful Commands for Development ----------------------"
	@echo "make help                            - show tasks you can run"
	@echo "make install-watch                   - runs install, and watches code for local development"
	@echo "make build-dev                       - builds a bundle with development settings"
	@echo "----------------------- Other Commands  -------------------------"
	@echo "make install                         - runs a set of scripts to ensure your environment is ready"
	@echo "make lint                            - runs eslint"
	@echo "make lint-fix                        - runs eslint --fix"
	@echo "make test                            - runs the full test suite with jest"
	@echo "make test-watch                      - runs tests as you develop"
	@echo "make test-coverage                   - creates a coverage report and opens it in your browser"
	@echo "make test-snapshots                  - runs test, updating snapshots"
	@echo "make clean                           - removes node_modules and built artifacts"
	@echo "----------------------- CI Commands  -------------------------"
	@echo "make build                           - builds a bundle with production settings"
	@echo "make build_and_deploy                - builds and deploys the production bundle"


# ---- YVM Command Stuff ----

.PHONY: install
install: build
	@use_local=true scripts/install.sh

.PHONY: install-watch
install-watch: node_modules
	scripts/install-watch.sh


# ---- Infrastructure for Test/Deploy ----

.PHONY: build
build: node_modules
	$(WEBPACK) --config webpack/webpack.config.base.js

.PHONY: build-dev
build-dev: node_modules
	$(WEBPACK) --config webpack/webpack.config.dev.js

.PHONY: build_and_deploy
build_and_deploy: node_modules
	$(WEBPACK) --config webpack/webpack.config.deploy.js


# -------------- Linting --------------


.PHONY: lint
lint: node_modules
	$(ESLINT) .

.PHONY: lint-fix
lint-fix: node_modules
	$(ESLINT) --fix .


# -------------- Testing --------------

.PHONY: test
test: node_modules
	$(JEST)

.PHONY: test-watch
test-watch: node_modules
	$(JEST) --watch

# CODECOV_TOKEN is set by CIRCLE_CI
.PHONY: test-coverage
test-coverage: node_modules
	$(JEST) --coverage
	$(CODECOV)

.PHONY: test-snapshots
test-snapshots: node_modules
	$(JEST) --updateSnapshotg


# ----------------- Helpers ------------------

.PHONY: node_modules
node_modules: $(YVM)
	$(YVM) exec install ${YARN_INSTALL_ARGS}
	touch node_modules

$(YVM):
	@echo "Installing the latest yvm release"
	@scripts/install.sh

.PHONY: clean
clean:
	rm -rf ${ARTIFACT_DIR}
	rm -f ~/.babel.json
	rm -rf node_modules

