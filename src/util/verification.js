import fs from 'fs'
import path from 'path'
import kbpgp from 'kbpgp'

import log from './log'

import { YARN_PUBLIC_KEY_URL } from './constants'
import { downloadFile, getDownloadPath } from './download'
import { getVersionDownloadUrl } from './utils'

export class VerificationError extends Error {}
export class PublicKeyImportError extends Error {}

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
    const detachedSig = fs.readFileSync(signatureFilePath)
    fs.unlinkSync(signatureFilePath)

    const keymanager = await new Promise((resolve, reject) => {
        kbpgp.KeyManager.import_from_armored_pgp(
            { armored: publicKey },
            (err, keymanager) =>
                err
                    ? reject(new PublicKeyImportError(err))
                    : resolve(keymanager),
        )
    })
    const keyRing = new kbpgp.keyring.KeyRing()
    keyRing.add_key_manager(keymanager)
    return new Promise((resolve, reject) => {
        kbpgp.unbox(
            {
                keyfetch: keyRing,
                armored: detachedSig,
                data: file,
            },
            err => (err ? reject(new VerificationError(err)) : resolve(true)),
        )
    })
}
