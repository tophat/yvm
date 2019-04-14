import fs from 'fs'
import path from 'path'
import * as openpgp from 'openpgp'

import log from './log'

import { YARN_PUBLIC_KEY_URL } from './constants'
import { downloadFile, getDownloadPath } from './download'
import { getVersionDownloadUrl } from './utils'

export class VerificationError extends Error {}

export const getPublicKeyPath = rootPath => path.resolve(rootPath, 'pubkey.gpg')

const getSignatureUrl = version => `${getVersionDownloadUrl(version)}.asc`

const getSignatureDownloadPath = (version, rootPath) =>
    `${getDownloadPath(version, rootPath)}.asc`

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

export const verifySignature = async (version, rootPath) => {
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

    if (!verified.signatures.length || !verified.signatures[0].valid) {
        throw new VerificationError()
    }
    return true
}
