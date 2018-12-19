const fs = require('fs-extra')

const { install, installLatest } = require('../../src/commands/install')
const { getExtractionPath, versionRootPath } = require('../../src/util/utils')

jest.mock('../../src/util/utils', () => {
    const MOCK_REMOTE_VERSIONS = ['1.6.0', '1.0.0']
    return {
        getVersionsFromTags: jest.fn().mockImplementation(() => {
            return Promise.resolve(MOCK_REMOTE_VERSIONS)
        }),
    }
})

describe('yvm install', () => {
    const rootPath = '/tmp/yvmInstall'

    beforeAll(() => {
        fs.mkdirsSync(rootPath)
    })

    afterEach(() => {
        fs.removeSync(versionRootPath(rootPath))
    })

    it('Installs a valid yarn version', () => {
        const version = '1.7.0'
        return install(version, rootPath).then(() => {
            expect(
                fs.statSync(getExtractionPath(version, rootPath)),
            ).toBeTruthy()
        })
    })

    it('Installs two versions of Yarn', () => {
        const v1 = '1.7.0'
        const v2 = '1.6.0'
        return Promise.all([install(v1, rootPath), install(v2, rootPath)]).then(
            () => {
                expect(
                    fs.statSync(getExtractionPath(v1, rootPath)),
                ).toBeTruthy()
                expect(
                    fs.statSync(getExtractionPath(v2, rootPath)),
                ).toBeTruthy()
            },
        )
    })

    it('Installs doesnt install an invalid version of Yarn', () => {
        const version = '0.0.0'
        return install(version, rootPath).catch(() => {
            expect(() =>
                fs.statSync(getExtractionPath(version, rootPath)),
            ).toThrow()
        })
    })

    it('installs the lastest version of yarn', () => {
        const latestVersion = '1.6.0'
        return installLatest(rootPath).then(() => {
            expect(
                fs.statSync(getExtractionPath(latestVersion, rootPath)),
            ).toBeTruthy()
        })
    })
})
