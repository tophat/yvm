import fs from 'fs'
import path from 'path'

import targz from 'targz'

import { YARN_RELEASE_TAGS_URL } from 'util/constants'
import { LATEST, STABLE } from 'util/alias'
import { downloadFile, getDownloadPath } from 'util/download'
import log from 'util/log'
import { yvmPath } from 'util/path'
import {
    getExtractionPath,
    getVersionDownloadUrl,
    versionRootPath,
} from 'util/utils'
import { getSplitVersionAndArgs, resolveVersion } from 'util/version'
import { VerificationError, verifySignature } from 'util/verification'

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

const extractYarn = async (version, rootPath) => {
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
                    return reject(err)
                }
                log(`Finished extracting yarn version ${version}`)
                const [pkgDir] = fs.readdirSync(tmpPath)
                if (!pkgDir) {
                    const errorMessage = 'Unable to locate extracted package'
                    return reject(new Error(errorMessage))
                }
                const pkgPath = path.resolve(tmpPath, pkgDir)
                fs.renameSync(pkgPath, destPath)
                fs.unlinkSync(srcPath)
                fs.rmdirSync(tmpPath)
                return resolve(destPath)
            },
        )
    })
}

const logVerifyNotice = extraMessage => {
    log.notice(`Unable to verify GPG signature.
Note, this may happen on older yarn versions if the public key used to sign those versions has expired.`)
    extraMessage && log(extraMessage)
}

const logHelpful = error => {
    if (error instanceof VerificationError) {
        return logVerifyNotice(
            "If you would like to proceed anyway, re-run 'yvm install' without the '--verify' flag",
        )
    }

    log(error.message)
    log.info(error.stack)
}

export const installVersion = async ({
    version: versionString,
    verifyGPG = false,
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
        throw new Error(`Installation aborted, probably caused by a defective release
\u2717 ${YARN_RELEASE_TAGS_URL}/v${version}
Please retry with the next available version`)
    }
    log(`Finished downloading yarn version ${version}`)

    log('Validating...')
    try {
        await verifySignature(version, rootPath)
        log('GPG signature validated')
    } catch (e) {
        if (e instanceof VerificationError && !verifyGPG) {
            logVerifyNotice()
        } else {
            throw e
        }
    }

    log('Extracting...')
    await extractYarn(version, rootPath)
    log('Installation successful')
}

export const ensureVersionInstalled = async (version, rootPath = yvmPath) => {
    if (isVersionInstalled(version, rootPath)) return
    await installVersion({ version, rootPath })
}

export const install = async ({ latest, stable, version, verifyGPG } = {}) => {
    try {
        if (stable) {
            version = STABLE
        } else if (latest) {
            version = LATEST
        } else if (!version) {
            version = (await getSplitVersionAndArgs())[0]
        }
        await installVersion({ version, verifyGPG })
        return 0
    } catch (e) {
        logHelpful(e)
        return 1
    }
}
