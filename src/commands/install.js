const fs = require('fs')
const path = require('path')
const request = require('request')
const targz = require('targz')

const { LATEST_VERSION_TAG } = require('../util/version')
const log = require('../common/log')
const {
    versionRootPath,
    getExtractionPath,
    getLatestVersion,
    getVersionsFromTags,
    yvmPath,
} = require('../common/utils')

const directoryStack = []

const getDownloadPath = (version, rootPath) =>
    path.resolve(rootPath, 'versions', `v${version}.tar.gz`)

const getUrl = version =>
    `https://yarnpkg.com/downloads/${version}/yarn-v${version}.tar.gz`

const checkDirectories = rootPath => {
    if (!fs.existsSync(versionRootPath(rootPath))) {
        fs.mkdirSync(versionRootPath(rootPath))
        directoryStack.push(versionRootPath(rootPath))
    }
}

const cleanDirectories = () => {
    while (directoryStack.length) {
        fs.rmdirSync(directoryStack.pop())
    }
}

const checkForVersion = (version, rootPath) => {
    const versionPath = getExtractionPath(version, rootPath)
    checkDirectories(rootPath)
    return fs.existsSync(versionPath)
}

const validateVersion = version =>
    getVersionsFromTags().then(versions => {
        if (versions.indexOf(version) === -1) {
            log(
                'You have provided an invalid version number. use "yvm ls-remote" to see valid versions.',
            )
            return Promise.reject()
        }
        return Promise.resolve()
    })

const downloadVersion = (version, rootPath) => {
    const url = getUrl(version)
    const filePath = getDownloadPath(version, rootPath)
    const file = fs.createWriteStream(filePath)

    return new Promise((resolve, reject) => {
        const stream = request.get(url).pipe(file)
        stream.on('finish', () => resolve())
        stream.on('error', err => {
            reject(new Error(err))
        })
    })
}

const extractYarn = (version, rootPath) => {
    const destPath = versionRootPath(rootPath)
    const srcPath = getDownloadPath(version, rootPath)

    return new Promise((resolve, reject) => {
        targz.decompress(
            {
                src: srcPath,
                dest: destPath,
            },
            err => {
                if (err) {
                    log(err)
                    reject(err)
                } else {
                    log(`Finished extracting yarn version ${version}`)
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

const installVersion = (desiredVersion, rootPath = yvmPath) => {
    if (checkForVersion(desiredVersion, rootPath)) {
        log(
            `It looks like you already have yarn ${desiredVersion} installed...`,
        )
        return Promise.resolve()
    }
    const versionPromise =
        desiredVersion === LATEST_VERSION_TAG
            ? getLatestVersion('yarnpkg', 'yarn')
            : validateVersion(desiredVersion)
    return versionPromise
        .then(version => {
            log(`Installing yarn v${version} in ${rootPath}`)
            return downloadVersion(version, rootPath)
                .then(() => {
                    log(`Finished downloading yarn version ${version}`)
                    return extractYarn(version, rootPath)
                })
                .catch(err => {
                    cleanDirectories()
                    return Promise.reject(err)
                })
        })
        .catch(error => {
            if (error) {
                log(error)
            }
        })
}

module.exports = installVersion
