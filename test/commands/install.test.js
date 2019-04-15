import fs from 'fs-extra'
import targz from 'targz'

import { resolveStable } from 'util/alias'
import { YARN_RELEASE_TAGS_URL } from 'util/constants'
import * as download from 'util/download'
import {
    ensureVersionInstalled,
    install,
    getDownloadPath,
    getPublicKeyPath,
} from 'commands/install'
import log from 'util/log'
import { yvmPath as rootPath } from 'util/path'
import {
    getVersionsFromTags,
    getExtractionPath,
    versionRootPath,
} from 'util/utils'
import * as version from 'util/version'

jest.setTimeout(10000)
jest.mock('util/path', () => ({
    yvmPath: '/tmp/cmd/install/yvm',
    getPathEntries: () => [],
}))
jest.spyOn(log, 'default')
jest.spyOn(log, 'info')
const downloadFile = jest.spyOn(download, 'downloadFile')
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

    it('Downloads public key signature if none exist locally', async () => {
        const publicKeyPath = getPublicKeyPath(rootPath)
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
        expect(results.every(v => v === 0)).toBe(true)
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

    it('Print warning on install defective yarn release version', async () => {
        const version = '1.3.0'
        const downloadPath = getDownloadPath(version, rootPath)
        const extractionPath = getExtractionPath(version, rootPath)
        downloadFile.mockImplementationOnce(() => {
            throw new Error('download failed')
        })
        expect(await install({ version })).toBe(1)
        expect(() => fs.statSync(downloadPath)).toThrow()
        expect(() => fs.statSync(extractionPath)).toThrow()
        const logMessages = log.default.mock.calls
            .map(args => args.join(' '))
            .join(';')
            .toLowerCase()
        const expectedPhrases = [
            'installation aborted',
            'defective release',
            `${YARN_RELEASE_TAGS_URL}/v${version}`,
            'please retry',
            'next available version',
        ]
        expectedPhrases.forEach(s => expect(logMessages).toMatch(s))
    })

    it('Logs error on failed targz decompress', async () => {
        const version = '1.7.0'
        const mockError = new Error('mock error')
        jest.spyOn(targz, 'decompress').mockImplementationOnce((_, callback) =>
            callback(mockError),
        )
        expect(await install({ version })).toBe(1)
        expect(log.default).toHaveBeenLastCalledWith(mockError.message)
        expect(log.info).toHaveBeenLastCalledWith(mockError.stack)
        targz.decompress.mockRestore()
    })

    it('Handles error if extracted archive does not contain yarn dist', async () => {
        const version = '1.7.0'
        const expectedErrorMessage = 'Unable to locate extracted package'
        jest.spyOn(targz, 'decompress').mockImplementationOnce(
            ({ dest }, callback) => {
                fs.emptyDirSync(dest)
                callback()
            },
        )
        expect(await install({ version })).toBe(1)
        expect(log.default).toHaveBeenLastCalledWith(expectedErrorMessage)
        targz.decompress.mockRestore()
    })
})
