import fs from 'fs-extra'
import targz from 'targz'

import { LATEST } from '../../src/util/alias'
import {
    ensureVersionInstalled,
    installVersion,
    getDownloadPath,
    getPublicKeyPath,
} from '../../src/commands/install'
import {
    getVersionsFromTags,
    getExtractionPath,
    versionRootPath,
} from '../../src/util/utils'
import { YARN_RELEASE_TAGS_URL } from '../../src/util/constants'
import * as download from '../../src/util/download'
import { yvmPath as rootPath } from '../../src/util/path'
import log from '../../src/util/log'

jest.mock('../../src/util/path', () => ({
    yvmPath: '/tmp/yvmInstall',
    getPathEntries: () => [],
}))
jest.setTimeout(10000)
jest.spyOn(log, 'default')
const downloadFile = jest.spyOn(download, 'downloadFile')

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
        await installVersion({ version: '1.8.0', yvmPath: rootPath })
        expect(fs.existsSync(publicKeyPath)).toBeTruthy()
    })

    it('Installs a valid yarn version', () => {
        const version = '1.7.0'
        return installVersion({ version, yvmPath: rootPath }).then(() => {
            expect(
                fs.statSync(getExtractionPath(version, rootPath)),
            ).toBeTruthy()
        })
    })

    it('Uses default yvmPath on install version', async () => {
        const version = '1.7.0'
        await installVersion({ version })
        expect(fs.statSync(getExtractionPath(version, rootPath))).toBeTruthy()
    })

    it('Does not reinstall an existing yarn version', async () => {
        const version = '1.7.0'
        await installVersion({ version, yvmPath: rootPath })
        expect(fs.statSync(getExtractionPath(version, rootPath))).toBeTruthy()
        await installVersion({ version, yvmPath: rootPath })
        expect(log.default).toHaveBeenLastCalledWith(
            `It looks like you already have yarn ${version} installed...`,
        )
    })

    it('Installs two versions of Yarn', () => {
        const v1 = '1.7.0'
        const v2 = '1.6.0'
        return Promise.all([
            installVersion({ version: v1, yvmPath: rootPath }),
            installVersion({ version: v2, yvmPath: rootPath }),
        ]).then(() => {
            expect(fs.statSync(getExtractionPath(v1, rootPath))).toBeTruthy()
            expect(fs.statSync(getExtractionPath(v2, rootPath))).toBeTruthy()
        })
    })

    it('Does not install an invalid version of Yarn', () => {
        const version = '0.0.0'
        return installVersion({ version, yvmPath: rootPath }).catch(() => {
            expect(() =>
                fs.statSync(getExtractionPath(version, rootPath)),
            ).toThrow()
        })
    })

    it('Installs the lastest version of yarn', () => {
        return Promise.all([
            getVersionsFromTags(),
            installVersion({ version: LATEST, yvmPath: rootPath }),
        ]).then(results => {
            const remoteVersions = results[0]
            const latestVersion = remoteVersions[0]
            expect(
                fs.statSync(getExtractionPath(latestVersion, rootPath)),
            ).toBeTruthy()
        })
    })

    it('Uses default yvmPath on install latest', async () => {
        const [[latestVersion]] = await Promise.all([
            getVersionsFromTags(),
            installVersion({ version: LATEST }),
        ])
        expect(
            fs.statSync(getExtractionPath(latestVersion, rootPath)),
        ).toBeTruthy()
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
            throw new Error()
        })
        await installVersion({ version, yvmPath: rootPath })
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
        const mockError = 'mock error'
        jest.spyOn(targz, 'decompress').mockImplementationOnce((_, callback) =>
            callback(mockError),
        )
        try {
            await installVersion({ version, yvmPath: rootPath })
        } catch (e) {
            expect(e).toEqual(mockError)
        }
        expect(log.default).toHaveBeenLastCalledWith(mockError)
        targz.decompress.mockRestore()
    })

    it('Handles error if extracted archive does not contain yarn dist', async () => {
        const version = '1.7.0'
        const expectedError = 'Unable to locate extracted package'
        jest.spyOn(targz, 'decompress').mockImplementationOnce(
            ({ dest }, callback) => {
                fs.mkdirSync(dest)
                callback()
            },
        )
        try {
            await installVersion({ version, yvmPath: rootPath })
        } catch (e) {
            expect(e).toEqual(expectedError)
        }
        targz.decompress.mockRestore()
    })
})
