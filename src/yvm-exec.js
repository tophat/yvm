/* eslint-disable global-require,import/no-dynamic-require */
const fs = require('fs')
const path = require('path')
const { yvmPath } = require('./common/utils')

const getYarnPath = (version, rootPath) =>
    path.resolve(rootPath, `versions/v${version}`)

/* eslint-disable no-undef, camelcase */
const execFile =
    typeof __webpack_require__ === 'function'
        ? __non_webpack_require__
        : require
/* eslint-enable no-undef, camelcase */

const runYarn = (version, extraArgs, rootPath) => {
    // first two arguments are filler args [node version, yarn version]
    process.argv = ['', ''].concat(extraArgs)
    execFile(path.resolve(getYarnPath(version, rootPath), 'bin/yarn.js'))
}

const execCommand = () => {
    const version = '1.0.2'
    const rootPath = yvmPath
    const extraArgs = process.argv.slice(2)

    if (!fs.existsSync(getYarnPath(version, rootPath))) {
        /*
         const install = require('./install')
        return install(version, rootPath)
            .then(() => runYarn(version, extraArgs, rootPath))
            .catch(() => Promise.reject())
            */
    }
    return Promise.resolve(runYarn(version, extraArgs, rootPath))
}

if (require.main === module) {
    execCommand()
}
