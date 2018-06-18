const path = require('path')
const fs = require('fs')
const request = require('request')
const os = require('os')


let directoryStack = []

const cleanDirectories = () => {
    while(directoryStack.length){
        fs.rmDirSync(directoryStack.pop())
    }
}
const checkDirectories = () => {
    const homeDir = os.homedir();
    const yvmPath = path.resolve(homeDir, './.yvm')
    const versionPath = path.resolve(yvmPath, './versions')

    if(!fs.existsSync(yvmPath)){
        fs.mkdirSync(yvmPath)
        directoryStack.push(yvmPath)
    }
    if(!fs.existsSync(versionPath)){
        fs.mkdirSync(versionPath)
        directoryStack.push(versionPath)
    }
}

const checkForVersion = version => {
    checkDirectories()
    return fs.existsSync(`~/.yvm/version/v${version}`)
}

const downloadVersion = version => {
    const url = `https://yarnpkg.com/downloads/${version}/yarn-v${version}.tar.gz`
    const versionPath = path.resolve(os.homedir(), `./.yvm/versions/v${version}/`)
    if(!fs.existsSync(versionPath)){
        fs.mkdirSync(versionPath)
        directoryStack.push(versionPath)
    }
    const filePath = path.resolve(os.homedir(), `./.yvm/versions/v${version}/yarn-v${version}.tar.gz`)
    const file = fs.createWriteStream(filePath)

    return new Promise((resolve, reject) => {
        const stream = request.get(url).pipe(file)
        stream.on('finish', () => resolve())
        stream.on('error', err => {
            console.log(err)
            reject()
        })
    })
}

const installVersion = version => {
    if(checkForVersion(version)){
        return
    }
    downloadVersion(version)
        .then(()=>{
            console.log(`Finished downloading yarn version ${versions}`)
        })
        .catch(() => {
            cleanDirectories()
        })

}

const yvmController = {
    installVersion
}

module.exports = yvmController
