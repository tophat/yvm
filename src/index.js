const fs = require('fs')
const os = require('os')
const path = require('path')
const request = require('request')
const targz = require('targz')

let directoryStack = []
const yvmPath = path.resolve(os.homedir(), '.yvm')
const versionRootPath = path.resolve(yvmPath, 'versions')

const checkDirectories = () => {
    if (!fs.existsSync(versionRootPath)) {
        fs.mkdirSync(versionRootPath)
        directoryStack.push(versionRootPath)
    }
}

const cleanDirectories = () => {
    while (directoryStack.length) {
        fs.rmdirSync(directoryStack.pop())
    }
}

const checkForVersion = version => {
    const versionPath = getVersionPath(version)
    checkDirectories()
    return fs.existsSync(versionPath)
}

const downloadVersion = version => {
    const url = getUrl(version)
    const versionPath = getVersionPath(version)
    if (!fs.existsSync(versionPath)) {
        fs.mkdirSync(versionPath)
        directoryStack.push(versionPath)
    }
    const filePath = getFilePath(version)
    const file = fs.createWriteStream(filePath)

    return new Promise((resolve, reject) => {
        const stream = request.get(url).pipe(file)
        stream.on('finish', () => resolve())
        stream.on('error', err => {
            reject(new Error(err))
        })
    })
}

const extractYarn = version => {
    const destPath = getVersionPath(version)
    const srcPath = getFilePath(version)
    targz.decompress(
        {
            src: srcPath,
            dest: destPath
        },
        err => {
            if (err) {
                console.log(err)
            } else {
                console.log(`Finished extracting yarn version ${version}`)
                fs.unlinkSync(srcPath)
            }
        }
    )
}

const getFilePath = version =>
    path.resolve(getVersionPath(version), `yarn-v${version}.tar.gz`)

const getUrl = version =>
    `https://yarnpkg.com/downloads/${version}/yarn-v${version}.tar.gz`

const getVersionPath = version => path.resolve(versionRootPath, `v${version}`)

const installVersion = version => {
    if (checkForVersion(version)) {
        return
    }
    downloadVersion(version)
        .then(() => {
            console.log(`Finished downloading yarn version ${version}`)
            extractYarn(version)
        })
        .catch(err => {
            console.log(`Downloading yarn failed: \n ${err}`)
            cleanDirectories()
        })
}

const yvmController = {
    installVersion
}

module.exports = yvmController
