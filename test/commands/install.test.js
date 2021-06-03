import fs from 'fs-extra'

import * as extractUtils from 'util/extract'
import { resolveStable } from 'util/alias'
import { YARN_RELEASE_TAGS_URL } from 'util/constants'
import * as download from 'util/download'
import * as verification from 'util/verification'
import log from 'util/log'
import { yvmPath as rootPath } from 'util/path'
import {
    getExtractionPath,
    getVersionsFromTags,
    versionRootPath,
} from 'util/utils'
import * as version from 'util/version'
import { ensureVersionInstalled, install } from 'commands/install'

jest.setTimeout(10000)
jest.unmock('fs')
jest.mock('util/path', () => ({
    yvmPath: '/tmp/cmd/install/yvm',
    getPathEntries: () => [],
}))
jest.spyOn(log, 'default')
jest.spyOn(log, 'info')
const downloadFile = jest.spyOn(download, 'downloadFile')
const verifySignature = jest.spyOn(verification, 'verifySignature')
const getSplitVersionAndArgs = jest.spyOn(version, 'getSplitVersionAndArgs')

describe('yvm install', () => {
    beforeAll(() => {
        fs.mkdirsSync(rootPath)
    })

    afterEach(() => {
        fs.removeSync(versionRootPath(rootPath))
        jest.clearAllMocks()
    })

    afterAll(() => {
        jest.restoreAllMocks()
    })

    const verifyLogPrints = (...expectedPhrases) => {
        const logMessages = log.default.mock.calls
            .map((args) => args.join(' '))
            .join(';')
            .toLowerCase()
        expectedPhrases.forEach((s) => expect(logMessages).toMatch(s))
    }

    it('Downloads public key signature if none exist locally', async () => {
        const publicKeyPath = verification.getPublicKeyPath(rootPath)
        fs.removeSync(publicKeyPath)
        const exitCode = await install({ version: '1.8.0' })
        expect(exitCode).toBe(0)
        expect(fs.existsSync(publicKeyPath)).toBeTruthy()
    })

    it('Installs a valid yarn version', async () => {
        const version = '1.7.0'
        expect(await install({ version })).toEqual(0)
        expect(fs.statSync(getExtractionPath(version, rootPath))).toBeTruthy()
    })

    it('Uses default yvmPath on install version', async () => {
        const version = '1.7.0'
        expect(await install({ version })).toEqual(0)
        expect(fs.statSync(getExtractionPath(version, rootPath))).toBeTruthy()
    })

    it('Does not reinstall an existing yarn version', async () => {
        const version = '1.7.0'
        expect(await install({ version })).toEqual(0)
        expect(fs.statSync(getExtractionPath(version, rootPath))).toBeTruthy()
        expect(await install({ version })).toEqual(0)
        expect(log.default).toHaveBeenLastCalledWith(
            `It looks like you already have yarn ${version} installed...`,
        )
    })

    it('Installs two versions of Yarn', async () => {
        const v1 = '1.7.0'
        const v2 = '1.6.0'
        const results = await Promise.all([
            install({ version: v1 }),
            install({ version: v2 }),
        ])
        expect(results.every((v) => v === 0)).toBe(true)
        expect(fs.statSync(getExtractionPath(v1, rootPath))).toBeTruthy()
        expect(fs.statSync(getExtractionPath(v2, rootPath))).toBeTruthy()
    })

    it('Does not install an invalid version of Yarn', async () => {
        const version = '0.0.0'
        expect(await install({ version })).toEqual(1)
        expect(() =>
            fs.statSync(getExtractionPath(version, rootPath)),
        ).toThrow()
    })

    it('Installs the lastest version of yarn', async () => {
        const [[latestVersion], exitCode] = await Promise.all([
            getVersionsFromTags(),
            install({ latest: true }),
        ])
        expect(exitCode).toBe(0)
        expect(
            fs.statSync(getExtractionPath(latestVersion, rootPath)),
        ).toBeTruthy()
    })

    it('Installs the stable version of yarn', async () => {
        const [stableVersion, exitCode] = await Promise.all([
            resolveStable(),
            install({ stable: true }),
        ])
        expect(exitCode).toBe(0)
        expect(
            fs.statSync(getExtractionPath(stableVersion, rootPath)),
        ).toBeTruthy()
    })

    it('Installs using fallback version', async () => {
        const version = '1.7.0'
        getSplitVersionAndArgs.mockReturnValueOnce([version])
        expect(await install()).toBe(0)
    })

    describe('ensureVersionInstalled', () => {
        it('Installs into default yvm path if none specified', async () => {
            const version = '1.7.0'
            await ensureVersionInstalled(version)
            expect(
                fs.statSync(getExtractionPath(version, rootPath)),
            ).toBeTruthy()
        })

        it('Only attempts installation if version not installed', async () => {
            const version = '1.7.0'
            fs.removeSync(versionRootPath(rootPath))
            await ensureVersionInstalled(version, rootPath)
            expect(
                fs.statSync(getExtractionPath(version, rootPath)),
            ).toBeTruthy()
            downloadFile.mockClear()
            await ensureVersionInstalled(version, rootPath)
            expect(downloadFile).not.toHaveBeenCalled()
        })
    })

    it('Prints warning on verification fails for yarn release', async () => {
        const version = '1.7.0'
        const { VerificationError } = verification
        verifySignature.mockRejectedValueOnce(new VerificationError())
        expect(await install({ version })).toBe(0)
        expect(fs.statSync(getExtractionPath(version, rootPath))).toBeTruthy()
        verifyLogPrints(
            'unable to verify gpg signature',
            'public key used to sign those versions has expired',
        )
    })

    it('Fails on verification fails for yarn release', async () => {
        const version = '1.7.0'
        const downloadPath = download.getDownloadPath(version, rootPath)
        const extractionPath = getExtractionPath(version, rootPath)
        const { VerificationError } = verification
        verifySignature.mockRejectedValueOnce(new VerificationError())
        expect(await install({ version, verifyGPG: true })).toBe(1)
        expect(fs.statSync(downloadPath)).toBeTruthy()
        expect(() => fs.statSync(extractionPath)).toThrow()
        verifyLogPrints(
            'unable to verify gpg signature',
            'public key used to sign those versions has expired',
            'if you would like to proceed anyway',
            "re-run 'yvm install' without the '--verify' flag",
        )
    })

    it('Print warning on install defective yarn release version', async () => {
        const version = '1.3.0'
        const downloadPath = download.getDownloadPath(version, rootPath)
        const extractionPath = getExtractionPath(version, rootPath)
        downloadFile.mockImplementationOnce(() => {
            throw new Error('download failed')
        })
        expect(await install({ version })).toBe(1)
        expect(() => fs.statSync(downloadPath)).toThrow()
        expect(() => fs.statSync(extractionPath)).toThrow()
        verifyLogPrints(
            'installation aborted',
            'defective release',
            `${YARN_RELEASE_TAGS_URL}/v${version}`,
            'please retry',
            'next available version',
        )
    })

    it('Logs error on failed targz decompress', async () => {
        const version = '1.7.0'
        const mockError = new Error('mock error')
        jest.spyOn(extractUtils, 'extract').mockImplementationOnce(() => {
            throw mockError
        })
        expect(await install({ version })).toBe(1)
        expect(log.default).toHaveBeenLastCalledWith(mockError.message)
        expect(log.info).toHaveBeenLastCalledWith(mockError.stack)
        extractUtils.extract.mockRestore()
    })

    it('Handles error if extracted archive does not contain yarn dist', async () => {
        const version = '1.7.0'
        const expectedErrorMessage = 'Unable to locate extracted package'

        const origExtract = extractUtils.extract
        jest.spyOn(extractUtils, 'extract').mockImplementationOnce(
            async (...params) => {
                const dest = await origExtract(...params)
                fs.emptyDirSync(dest)
            },
        )
        expect(await install({ version })).toBe(1)
        expect(log.default).toHaveBeenLastCalledWith(expectedErrorMessage)
        extractUtils.extract.mockRestore()
    })
})
