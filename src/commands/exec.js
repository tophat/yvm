/* eslint-disable global-require,import/no-dynamic-require */
const fs = require('fs')
const os = require('os')
const path = require('path')

const getYarnPath = version =>
    path.resolve(os.homedir(), `.yvm/versions/v${version}`)

const runYarn = (version, extraArgs) => {
    process.argv = ['', ''].concat(extraArgs) // first two arguments are filler args [node version, yarn version]
    require(path.resolve(getYarnPath(version), 'bin/yarn.js'))
}

const execCommand = (version, extraArgs) => {
    if (!fs.existsSync(getYarnPath(version))) {
        const install = require('./install')
        return install(version).then(() => runYarn(version, extraArgs))
    } else {
        return Promise.resolve(runYarn(version, extraArgs))
    }
}

module.exports = execCommand
