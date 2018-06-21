/* eslint-disable global-require,import/no-dynamic-require */
const fs = require('fs')
const os = require('os')
const path = require('path')

const getYarnPath = version =>
    path.resolve(os.homedir(), `.yvm/versions/v${version}`)

const runYarn = (version, extraArgs) => {
    process.argv = ['', ''].concat(extraArgs) // first two arguments are filler args [node version, yarn version]
    // eslint-disable-next-line no-undef
    __non_webpack_require__(path.resolve(getYarnPath(version), 'bin/yarn.js'))
}

const execCommand = (version, extraArgs) => {
    if (!fs.existsSync(getYarnPath(version))) {
        const install = require('./install')
        install(version).then(() => runYarn(version, extraArgs))
    } else {
        runYarn(version, extraArgs)
    }
}

module.exports = execCommand
