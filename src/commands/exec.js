/* eslint-disable global-require,import/no-dynamic-require */
const fs = require('fs')
const path = require('path')
const { yvmPath } = require('../common/utils')

const getYarnPath = (version, rootPath) =>
    path.resolve(rootPath, `versions/v${version}`)

/* eslint-disable no-undef, camelcase */
const execFile =
    typeof __webpack_require__ === 'function'
        ? __non_webpack_require__
        : require
/* eslint-enable no-undef, camelcase */

const runYarn = (version, extraArgs, rootPath) => {
    process.argv = ['', ''].concat(extraArgs) // first two arguments are filler args [node version, yarn version]
    execFile(path.resolve(getYarnPath(version, rootPath), 'bin/yarn.js'))
}

const execCommand = (version, extraArgs, rootPath = yvmPath) => {
    if (!fs.existsSync(getYarnPath(version, rootPath))) {
        const install = require('./install')
        return install(version, rootPath).then(() =>
            runYarn(version, extraArgs, rootPath),
        )
    }
    return Promise.resolve(runYarn(version, extraArgs, rootPath))
}

module.exports = execCommand
