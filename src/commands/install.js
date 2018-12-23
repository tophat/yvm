const fs = require('fs')
const openpgp = require('openpgp')
const path = require('path')
const targz = require('targz')

const { downloadFile } = require('../util/download')
const log = require('../util/log')
const {
    versionRootPath,
    getExtractionPath,
    getVersionsFromTags,
} = require('../util/utils')
const { yvmPath } = require('../util/path')

const getDownloadPath = (version, rootPath) =>
    path.resolve(rootPath, 'versions', `v${version}.tar.gz`)

const getSignatureDownloadPath = (version, rootPath) =>
    `${getDownloadPath(version, rootPath)}.asc`

const getPublicKeyPath = rootPath => path.resolve(rootPath, 'pubkey.gpg')

const getUrl = version =>
    `https://yarnpkg.com/downloads/${version}/yarn-v${version}.tar.gz`

const getSignatureUrl = version => `${getUrl(version)}.asc`

const isVersionInstalled = (version, rootPath) => {
    const versionPath = getExtractionPath(version, rootPath)
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

const getPublicKey = async rootPath => {
    const publicKeyPath = getPublicKeyPath(rootPath)

    if (fs.existsSync(publicKeyPath)) {
        log.info('GPG public key file already downloaded')
    } else {
        log.info('Downloading GPG public key file')
        await downloadFile(
            'https://dl.yarnpkg.com/debian/pubkey.gpg',
            publicKeyPath,
        )
    }
    return fs.readFileSync(publicKeyPath)
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

const installVersion = async (version, rootPath = yvmPath) => {
    if (!fs.existsSync(versionRootPath(rootPath))) {
        fs.mkdirSync(versionRootPath(rootPath))
    }

    if (isVersionInstalled(version, rootPath)) {
        log(`It looks like you already have yarn ${version} installed...`)
        return
    }

    const versions = await getVersionsFromTags()
    if (versions.indexOf(version) === -1) {
        log(
            'You have provided an invalid version number. use "yvm ls-remote" to see valid versions.',
        )
        throw new Error('Invalid version number provided')
    }

    log(`Installing yarn v${version} in ${rootPath}`)
    await downloadVersion(version, rootPath)

    log(`Finished downloading yarn version ${version}`)
    await verifySignature(version, rootPath)

    log('GPG signature validated')
    return extractYarn(version, rootPath)
}

const installLatest = (rootPath = yvmPath) => {
    return getVersionsFromTags()
        .then(versions => {
            const latestVersion = versions[0]
            return installVersion(latestVersion, rootPath)
        })
        .catch(err => {
            log(err)
        })
}

const ensureVersionInstalled = (version, rootPath = yvmPath) => {
    const yarnBinDir = getExtractionPath(version, rootPath)
    if (fs.existsSync(yarnBinDir)) {
        return Promise.resolve()
    }
    return installVersion(version, rootPath)
}

module.exports = { installVersion, installLatest, ensureVersionInstalled }
