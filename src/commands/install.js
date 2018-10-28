const fs = require('fs')
const openpgp = require('openpgp')
const path = require('path')
const request = require('request')
const targz = require('targz')

const { downloadFile } = require('../util/download')
const log = require('../util/log')
const {
    versionRootPath,
    getExtractionPath,
    getVersionsFromTags,
    yvmPath,
} = require('../util/utils')

const directoryStack = []

const getDownloadPath = (version, rootPath) =>
    path.resolve(rootPath, 'versions', `v${version}.tar.gz`)

const getSignatureDownloadPath = (version, rootPath) =>
    `${getDownloadPath(version, rootPath)}.asc`

const getPublicKeyPath = rootPath => path.resolve(rootPath, 'pubkey.gpg')

const getUrl = version =>
    `https://yarnpkg.com/downloads/${version}/yarn-v${version}.tar.gz`

const getSignatureUrl = version => `${getUrl(version)}.asc`

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

const downloadVersion = (version, rootPath) => {
    const url = getUrl(version)
    const filePath = getDownloadPath(version, rootPath)
    return downloadFile(url, filePath)
}

const downloadSignature = (version, rootPath) => {
    const url = getSignatureUrl(version)
    const filePath = getSignatureDownloadPath(version, rootPath)
    return downloadFile(url, filePath)
}

const getPublicKey = rootPath => {
    const publicKeyPath = getPublicKeyPath(rootPath)

    return new Promise((resolve, reject) => {
        if (fs.existsSync(publicKeyPath)) {
            log('GPG public key file already downloaded')
            resolve()
        } else {
            log('Downloading GPG public key file')
            const file = fs.createWriteStream(publicKeyPath)
            const stream = request
                .get('https://dl.yarnpkg.com/debian/pubkey.gpg')
                .pipe(file)
            stream.on('finish', () => resolve())
            stream.on('error', err => {
                reject(new Error(err))
            })
        }
    }).then(() => fs.readFileSync(publicKeyPath))
}

const verifySignature = async (version, rootPath) => {
    await downloadSignature(version, rootPath)

    const filePath = getDownloadPath(version, rootPath)
    const signatureFilePath = getSignatureDownloadPath(version, rootPath)
    const publicKey = await getPublicKey(rootPath)

    const file = fs.readFileSync(filePath)
    const sig = fs.readFileSync(signatureFilePath)
    fs.unlinkSync(signatureFilePath)

    const verified = await openpgp.verify({
        message: await openpgp.message.fromBinary(file),
        signature: await openpgp.signature.readArmored(sig),
        publicKeys: (await openpgp.key.readArmored(publicKey)).keys,
    })

    return verified.signatures.length && verified.signatures[0].valid
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

const installVersion = (version, rootPath = yvmPath) => {
    if (checkForVersion(version, rootPath)) {
        log(`It looks like you already have yarn ${version} installed...`)
        return Promise.resolve()
    }
    return getVersionsFromTags()
        .then(versions => {
            if (versions.indexOf(version) === -1) {
                log(
                    'You have provided an invalid version number. use "yvm ls-remote" to see valid versions.',
                )
                return Promise.reject()
            }
            log(`Installing yarn v${version} in ${rootPath}`)
            return downloadVersion(version, rootPath)
                .then(() => {
                    log(`Finished downloading yarn version ${version}`)
                    return verifySignature(version, rootPath)
                })
                .then(() => {
                    log('GPG signature validated')
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
