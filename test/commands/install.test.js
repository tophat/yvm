const path = require('path')
const fs = require('fs-extra')
const targz = require('targz')

const log = require('../../src/util/log')
const download = require('../../src/util/download')
const {
    getVersionsFromTags,
    getExtractionPath,
    versionRootPath,
} = require('../../src/util/utils')

jest.mock('../../src/util/log')
const downloadFile = jest.spyOn(download, 'downloadFile')

const { installVersion, installLatest } = require('../../src/commands/install')

describe('yvm install', () => {
    const rootPath = '/tmp/yvmInstall'

    beforeAll(() => {
        fs.mkdirsSync(rootPath)
        jest.spyOn(targz, 'decompress').mockImplementation(
            ({ dest }, callback) => {
                fs.mkdirsSync(path.resolve(dest, 'mockDir'))
                callback()
            },
        )
    })

    afterEach(() => {
        fs.removeSync(versionRootPath(rootPath))
        jest.clearAllMocks()
    })

    afterAll(() => {
        jest.restoreAllMocks()
    })

    it('Installs a valid yarn version', () => {
        const version = '1.7.0'
        return installVersion({ version, rootPath }).then(() => {
            expect(
                fs.statSync(getExtractionPath(version, rootPath)),
            ).toBeTruthy()
        })
    })

    it('Installs two versions of Yarn', () => {
        const v1 = '1.7.0'
        const v2 = '1.6.0'
        return Promise.all([
            installVersion({ version: v1, rootPath }),
            installVersion({ version: v2, rootPath }),
        ]).then(() => {
            expect(fs.statSync(getExtractionPath(v1, rootPath))).toBeTruthy()
            expect(fs.statSync(getExtractionPath(v2, rootPath))).toBeTruthy()
        })
    })

    it('Does not install an invalid version of Yarn', () => {
        const version = '0.0.0'
        return installVersion({ version, rootPath }).catch(() => {
            expect(() =>
                fs.statSync(getExtractionPath(version, rootPath)),
            ).toThrow()
        })
    })

    it('Installs the lastest version of yarn', () => {
        return Promise.all([
            getVersionsFromTags(),
            installLatest({ rootPath }),
        ]).then(results => {
            const remoteVersions = results[0]
            const latestVersion = remoteVersions[0]
            expect(
                fs.statSync(getExtractionPath(latestVersion, rootPath)),
            ).toBeTruthy()
        })
    })

    it('Print warning on install defective yarn release version', async () => {
        const version = '1.3.0'
        const extractionPath = getExtractionPath(version, rootPath)
        downloadFile.mockImplementationOnce(() => {
            throw new Error()
        })
        await installVersion({ version, rootPath })
        expect(() => fs.statSync(extractionPath)).toThrow()
        const logMessages = log.mock.calls
            .map(args => args.join(' '))
            .join(';')
            .toLowerCase()
        const expectedPhrases = [
            'installation aborted',
            'defective release',
            `https://github.com/yarnpkg/yarn/releases/tag/v${version}`,
            'please retry',
            'next available version',
        ]
        expectedPhrases.forEach(s => expect(logMessages).toMatch(s))
    })
})
