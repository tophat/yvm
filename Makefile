ARTIFACT_DIR?=artifacts
TEST_REPORTS_DIR?=$(ARTIFACT_DIR)/reports
BUILD_DIR?=$(ARTIFACT_DIR)/build

ifdef CI
    ESLINT_EXTRA_ARGS=--format junit --output-file $(TEST_REPORTS_DIR)/lint/eslint.junit.xml
    JEST_ENV_VARIABLES=JEST_SUITE_NAME=yvm JEST_JUNIT_OUTPUT=$(TEST_REPORTS_DIR)/tests/jest.junit.xml
    JEST_ARGS=--ci --maxWorkers=2 --reporters jest-junit
    WEBPACK_ARGS=
    YARN_INSTALL_ARGS=--frozen-lockfile --ci
    YARN=$(HOME)/.yvm/yvm.sh exec
else
    ESLINT_EXTRA_ARGS=
    JEST_ENV_VARIABLES=
    JEST_ARGS=
    WEBPACK_ARGS=--progress
    YARN_INSTALL_ARGS=
    YARN=yarn
endif

ESLINT_ARGS=--max-warnings 0 $(ESLINT_EXTRA_ARGS)

NODE_MODULES_BIN := node_modules/.bin

CODECOV := $(NODE_MODULES_BIN)/codecov
ESLINT := $(NODE_MODULES_BIN)/eslint $(ESLINT_ARGS)
JEST := $(JEST_ENV_VARIABLES) $(NODE_MODULES_BIN)/jest $(JEST_ARGS)
WEBPACK := $(NODE_MODULES_BIN)/webpack $(WEBPACK_ARGS)

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
	@echo "make build-production                - builds a bundle with production settings"


# ---- YVM Command Stuff ----

.PHONY: install
install: build-production
	@USE_LOCAL=true scripts/install.sh

.PHONY: install-watch
install-watch: node_modules
	scripts/install-watch.sh


# ---- Webpack ----

.PHONY: build-production
build-production: node_modules_production node_modules
	$(WEBPACK) --config webpack/webpack.config.production.js

.PHONY: build-dev
build-dev: node_modules
	$(WEBPACK) --config webpack/webpack.config.development.js


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
	$(JEST) --updateSnapshot


# ----------------- Helpers ------------------

.PHONY: node_modules
node_modules:
	$(YARN) install ${YARN_INSTALL_ARGS}
	touch node_modules

.PHONY: node_modules_production
node_modules_production:
	$(YARN) install ${YARN_INSTALL_ARGS} --modules-folder node_modules_production --production
	touch node_modules_production

.PHONY: clean
clean:
	rm -rf ${ARTIFACT_DIR}
	rm -f ~/.babel.json
	rm -rf node_modules
