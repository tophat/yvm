import fs from 'fs'
import path from 'path'
import targz from 'targz'
import * as openpgp from 'openpgp'

import { YARN_PUBLIC_KEY_URL, YARN_RELEASE_TAGS_URL } from '../util/constants'
import { LATEST } from '../util/alias'
import { downloadFile } from '../util/download'
import log from '../util/log'
import { yvmPath } from '../util/path'
import {
    versionRootPath,
    getExtractionPath,
    getVersionDownloadUrl,
} from '../util/utils'
import { resolveVersion } from '../util/version'

export const getDownloadPath = (version, rootPath) =>
    path.resolve(rootPath, 'versions', `yarn-v${version}.tar.gz`)

const getSignatureDownloadPath = (version, rootPath) =>
    `${getDownloadPath(version, rootPath)}.asc`

export const getPublicKeyPath = rootPath => path.resolve(rootPath, 'pubkey.gpg')

const getSignatureUrl = version => `${getVersionDownloadUrl(version)}.asc`

const isVersionInstalled = (version, rootPath) => {
    const versionPath = getExtractionPath(version, rootPath)
    return fs.existsSync(versionPath)
}

const downloadVersion = async (version, rootPath) => {
    const url = getVersionDownloadUrl(version)
    const filePath = getDownloadPath(version, rootPath)
    try {
        await downloadFile(url, filePath)
        return true
    } catch (e) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
        log.error(e)
        return false
    }
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
        await downloadFile(YARN_PUBLIC_KEY_URL, publicKeyPath)
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
    const destPath = getExtractionPath(version, rootPath)
    const tmpPath = `${destPath}.tar.gz.tmp`
    const srcPath = getDownloadPath(version, rootPath)

    return new Promise((resolve, reject) => {
        targz.decompress(
            {
                src: srcPath,
                dest: tmpPath,
            },
            err => {
                if (err) {
                    log(err)
                    reject(err)
                } else {
                    log(`Finished extracting yarn version ${version}`)
                    const [pkgDir] = fs.readdirSync(tmpPath)
                    if (pkgDir) {
                        const pkgPath = path.resolve(tmpPath, pkgDir)
                        fs.renameSync(pkgPath, destPath)
                        fs.unlinkSync(srcPath)
                        fs.rmdirSync(tmpPath)
                        resolve(destPath)
                    } else {
                        reject('Unable to locate extracted package')
                    }
                }
            },
        )
    })
}

export const installVersion = async ({
    version: versionString,
    rootPath = yvmPath,
}) => {
    const version = await resolveVersion({
        versionString,
        yvmPath: rootPath,
    })
    if (!fs.existsSync(versionRootPath(rootPath))) {
        fs.mkdirSync(versionRootPath(rootPath))
    }

    if (isVersionInstalled(version, rootPath)) {
        log(`It looks like you already have yarn ${version} installed...`)
        return
    }

    log(`Installing yarn v${version} in ${rootPath}`)
    log('Downloading...')
    if (!(await downloadVersion(version, rootPath))) {
        log(`Installation aborted, probably caused by a defective release`)
        log(`\u2717 ${YARN_RELEASE_TAGS_URL}/v${version}`)
        log('Please retry with the next available version')
        return
    }
    log(`Finished downloading yarn version ${version}`)

    log('Validating...')
    await verifySignature(version, rootPath)
    log('GPG signature validated')

    log('Extracting...')
    await extractYarn(version, rootPath)
    log('Installation successful')
}

export const installLatest = async ({ rootPath = yvmPath } = {}) => {
    await installVersion({ rootPath, version: LATEST })
}

export const ensureVersionInstalled = async (version, rootPath = yvmPath) => {
    if (isVersionInstalled(version, rootPath)) return
    await installVersion({ version, rootPath })
}
