const fs = require('fs')
const os = require('os')
const path = require('path')

const getYarnPath = version => (
    path.resolve(os.homedir(), `.yvm/versions/v${version}`)
)

const runYarn = (version, extraArgs) => {
    process.argv = ['',''].concat(extraArgs) //first two arguments are filler args [node version, yarn version]
    require(path.resolve(getYarnPath(version), 'bin/yarn.js'))
}

const execCommand = (version, extraArgs) => {
    if(!fs.existsSync(getYarnPath(version))) {
        console.log(`Yarn v${version} not found. Please install it using: yvm install ${version}`)
        return
    }
    runYarn(version, extraArgs)
}

module.exports = execCommand
