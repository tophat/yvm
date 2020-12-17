ARTIFACT_DIR?=artifacts
TEST_REPORTS_DIR?=$(ARTIFACT_DIR)/reports
BUILD_DIR?=$(ARTIFACT_DIR)/webpack_build

ifdef CI
    ESLINT_EXTRA_ARGS=--format junit --output-file $(TEST_REPORTS_DIR)/lint/eslint.junit.xml
    JEST_ENV_VARIABLES=JEST_SUITE_NAME=yvm JEST_JUNIT_OUTPUT=$(TEST_REPORTS_DIR)/tests/jest.junit.xml
    JEST_ARGS=--ci --maxWorkers=2 --reporters=default --reporters=jest-junit
    WEBPACK_ARGS=
    YARN_INSTALL_ARGS=--pure-lockfile --ci
else
    ESLINT_EXTRA_ARGS=
    JEST_ENV_VARIABLES=
    JEST_ARGS=
    WEBPACK_ARGS=--progress
    YARN_INSTALL_ARGS=
endif

ESLINT_ARGS=--max-warnings 0 $(ESLINT_EXTRA_ARGS)

NODE_MODULES_BIN := node_modules/.bin

CODECOV := $(NODE_MODULES_BIN)/codecov
ESLINT := $(NODE_MODULES_BIN)/eslint $(ESLINT_ARGS)
MADGE := $(NODE_MODULES_BIN)/madge --circular src
BUNDLEWATCH := $(NODE_MODULES_BIN)/bundlewatch --config .bundlewatch.config.js
JEST := $(JEST_ENV_VARIABLES) $(NODE_MODULES_BIN)/jest $(JEST_ARGS)
WEBPACK := $(NODE_MODULES_BIN)/webpack $(WEBPACK_ARGS)
WEBPACK_BUILD_ := $(WEBPACK) --config webpack/webpack.config
WEBPACK_BUILD_DEV := $(WEBPACK_BUILD_).dev.js
WEBPACK_BUILD_DEV_WATCH := $(WEBPACK_BUILD_DEV) --watch

.PHONY: help
help:
	echo $(JEST)
	@echo "--------------------- Useful Commands for Development ----------------------"
	@echo "make help                            - show tasks you can run"
	@echo "make build                           - builds a bundle with development settings"
	@echo "make build-watch                     - builds and watches code for local development"
	@echo "make install-watch                   - runs install, and build-watch"
	@echo "----------------------- Other Commands  -------------------------"
	@echo "make install                         - runs a set of scripts to ensure your environment is ready"
	@echo "make lint                            - runs eslint"
	@echo "make lint-fix                        - runs eslint --fix"
	@echo "make lint-defend-circular            - runs madge to defend against circular imports"
	@echo "make test                            - runs the full test suite with jest"
	@echo "make test-watch                      - runs tests as you develop"
	@echo "make test-coverage                   - creates a coverage report and opens it in your browser"
	@echo "make test-snapshots                  - runs test, updating snapshots"
	@echo "make bundlewatch                     - runs bundlewatch to measure release size (run after build-production)"
	@echo "make clean                           - removes node_modules and built artifacts"
	@echo "----------------------- CI Commands  -------------------------"
	@echo "make build-production                - builds a bundle with production settings"


# ---- Webpack ----

.PHONY: build-production
build-production: node_modules clean_webpack_build
	 $(WEBPACK_BUILD_).prod.js

.PHONY: build
build: node_modules clean_webpack_build
	$(WEBPACK_BUILD_DEV)

.PHONY: build-watch
build-watch: node_modules clean_webpack_build
	$(WEBPACK_BUILD_DEV_WATCH)

# ---- YVM Command Stuff ----

.PHONY: install-local
install-local:
	@USE_LOCAL=true node scripts/install.js

.PHONY: install
install: build-production install-local

.PHONY: install-watch
install-watch: node_modules clean_webpack_build
	$(WEBPACK_BUILD_DEV_WATCH) --env.INSTALL=true

# -------------- Linting --------------

.PHONY: lint
lint:
	$(ESLINT) .

.PHONY: lint-fix
lint-fix:
	$(ESLINT) --fix .

.PHONY: lint-defend-circular
lint-defend-circular:
	$(MADGE)

# -------------- Testing --------------

.PHONY: test
test:
	$(JEST)

.PHONY: test-watch
test-watch:
	$(JEST) --watch

# CODECOV_TOKEN is set by GitHub Actions
.PHONY: test-coverage
test-coverage:
	$(JEST) --coverage
	$(CODECOV)

.PHONY: test-snapshots
test-snapshots:
	$(JEST) --updateSnapshot

.PHONY: sanities-bash
sanities-bash:
	YVM_DIR=~/.yvm bash ./test/scripts/yvm.test.sh

.PHONY: sanities-fish
sanities-fish:
	YVM_DIR=~/.yvm fish ./test/scripts/yvm.test.fish

.PHONY: sanities-zsh
sanities-zsh:
	YVM_DIR=~/.yvm zsh ./test/scripts/yvm.test.sh

# ----------------- Helpers ------------------

.PHONY: bundlewatch
bundlewatch:
	$(BUNDLEWATCH)

.PHONY: node_modules
node_modules:
	yarn install ${YARN_INSTALL_ARGS}
	touch node_modules

.PHONY: clean_node_modules
clean_node_modules:
	rm -rf node_modules

.PHONY: clean_webpack_build
clean_webpack_build:
	rm -rf ${BUILD_DIR}

.PHONY: clean
clean: clean_node_modules clean_webpack_build
	rm -rf ${ARTIFACT_DIR}
