/* eslint-disable global-require,import/no-dynamic-require */
const fs = require('fs')
const path = require('path')
const { yvmPath } = require('../common/utils')

const getYarnPath = (version, rootPath) =>
    path.resolve(rootPath, `versions/v${version}`)

const runYarn = (version, extraArgs, rootPath) => {
    process.argv = ['', ''].concat(extraArgs) // first two arguments are filler args [node version, yarn version]
    require(path.resolve(getYarnPath(version, rootPath), 'bin/yarn.js'))
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
