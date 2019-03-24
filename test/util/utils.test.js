import log from '../../src/util/log'
import {
    DEFAULT_VERSION_TEXT,
    VERSION_IN_USE_SYMBOL,
    VERSION_INSTALLED_SYMBOL,
    printVersions,
} from '../../src/util/version'

const versionInUse = '1.2.0'
const defaultVersion = '1.3.0'
const localVersions = ['1.1.0', versionInUse, defaultVersion]
const versions = [...localVersions, '1.4.0', '1.5.0']

describe('Util functions', () => {
    jest.spyOn(log, 'default')
    afterEach(() => {
        jest.resetAllMocks()
    })
    afterAll(jest.restoreAllMocks)

    it('Prints all versions passed to printVersion function', async () => {
        const versionsObject = await printVersions({
            message: 'print all versions',
            list: versions,
        })
        expect(Object.keys(versionsObject)).toHaveLength(versions.length)
        expect(log.default.mock.calls).toMatchSnapshot()
    })

    it('Highlights the version currently in use', async () => {
        const versionsObject = await printVersions({
            message: 'highlight current version',
            list: versions,
            versionInUse,
        })
        expect(versionsObject[versionInUse]).toContain(versionInUse)
        expect(versionsObject[versionInUse]).toContain(VERSION_IN_USE_SYMBOL)
        expect(log.default.mock.calls).toMatchSnapshot()
    })

    it('Highlights the default version', async () => {
        const versionsObject = await printVersions({
            message: 'highlight default version',
            list: versions,
            versionInUse,
            defaultVersion,
        })
        expect(versionsObject[defaultVersion]).toContain(defaultVersion)
        expect(versionsObject[defaultVersion]).toContain(DEFAULT_VERSION_TEXT)
        expect(log.default.mock.calls).toMatchSnapshot()
    })

    it('Highlights all installed versions', async () => {
        const versionsObject = await printVersions({
            message: 'highlight installed versions',
            list: versions,
            versionInUse,
            defaultVersion,
            localVersions,
        })
        localVersions
            .filter(v => v !== versionInUse)
            .forEach(v => {
                expect(versionsObject[v]).toContain(v)
                expect(versionsObject[v]).toContain(VERSION_INSTALLED_SYMBOL)
            })
        expect(log.default.mock.calls).toMatchSnapshot()
    })
})
