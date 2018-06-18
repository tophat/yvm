const fs = require('fs')
const os = require('os')
const path = require('path')

const getYarnCLI = version => (
    path.resolve(getYarnPath(version), 'bin/yarn.js')
)

const getYarnPath = version => (
    path.resolve(os.homedir(), `.yvm/versions/v${version}`)
)

const execCommand = (version, extraArgs) => {
    const yarnPath = getYarnPath(version)
    if(!fs.existsSync(yarnPath)) {
        console.log(`Yarn v${version} not found. Please install it using: yvm install ${version}`)
        return
    }

    const yarnCLI = getYarnCLI(version)
    process.argv = ['',''].concat(extraArgs) //first two arguments are filler args [node version, yarn version]
    require(yarnCLI)
}

module.exports = execCommand
