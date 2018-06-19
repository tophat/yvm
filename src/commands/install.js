const fs = require('fs')
const path = require('path')
const request = require('request')
const targz = require('targz')

const { versionRootPath, getExtractionPath } = require('../common/utils')

const directoryStack = []

const getDownloadPath = version =>
    path.resolve(versionRootPath, `v${version}.tar.gz`)

const getUrl = version =>
    `https://yarnpkg.com/downloads/${version}/yarn-v${version}.tar.gz`

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
    const versionPath = getExtractionPath(version)
    checkDirectories()
    return fs.existsSync(versionPath)
}

const downloadVersion = version => {
    const url = getUrl(version)
    const filePath = getDownloadPath(version)
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
    const destPath = versionRootPath
    const srcPath = getDownloadPath(version)

    return new Promise((resolve, reject) => {
        targz.decompress(
            {
                src: srcPath,
                dest: destPath,
            },
            err => {
                if (err) {
                    console.error(err)
                    reject(err)
                } else {
                    console.error(`Finished extracting yarn version ${version}`)
                    fs.renameSync(
                        `${destPath}/yarn-v${version}`,
                        `${destPath}/v${version}`,
                    )
                    fs.unlinkSync(srcPath)
                    resolve()
                }
            },
        )
    })
}

const installVersion = version => {
    if (checkForVersion(version)) {
        return Promise.resolve()
    }
    return downloadVersion(version)
        .then(() => {
            console.error(`Finished downloading yarn version ${version}`)
            return extractYarn(version)
        })
        .catch(err => {
            console.error(`Downloading yarn failed: \n ${err}`)
            cleanDirectories()
        })
}

module.exports = installVersion
