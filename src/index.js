const fs = require('fs')
const os = require('os')
const path = require('path')
const request = require('request')
const targz = require('targz')

let directoryStack = []

const checkDirectories = () => {
    const homeDir = os.homedir();
    const yvmPath = path.resolve(homeDir, './.yvm/')
    const versionPath = path.resolve(yvmPath, './versions/')

    if(!fs.existsSync(yvmPath)){
        fs.mkdirSync(yvmPath)
        directoryStack.push(yvmPath)
    }
    if(!fs.existsSync(versionPath)){
        fs.mkdirSync(versionPath)
        directoryStack.push(versionPath)
    }
}

const cleanDirectories = () => {
    while(directoryStack.length){
        fs.rmdirSync(directoryStack.pop())
    }
}

const checkForVersion = version => {
    checkDirectories()
    return fs.existsSync(`~/.yvm/version/v${version}/`)
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
            reject(new Error(err))
        })
    })
}

const extractYarn = version =>{
    const destPath = path.resolve(os.homedir(), `./.yvm/versions/v${version}`)
    const srcPath = path.resolve(destPath, `./yarn-v${version}.tar.gz`)
    targz.decompress({
        src: srcPath,
        dest: destPath
    }, err => {
        if (err){
            console.log(err)
        } else {
            console.log(`Finished extracting yarn version ${version}`)
            fs.unlinkSync(srcPath)
        }
    })
}

const installVersion = version => {
    if(checkForVersion(version)){
        return
    }
    downloadVersion(version)
        .then(()=>{
            console.log(`Finished downloading yarn version ${version}`)
            extractYarn(version)
        })
        .catch( err => {
            console.log(`Downloading yarn failed: \n ${err}`)
            cleanDirectories()
        })
}

const yvmController = {
    installVersion
}

module.exports = yvmController
