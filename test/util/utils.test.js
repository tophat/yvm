const {
    DEFAULT_VERSION_TEXT,
    VERSION_IN_USE_SYMBOL,
    VERSION_INSTALLED_SYMBOL,
    printVersions,
} = require('../../src/util/version')

const versionInUse = '1.2.0'
const defaultVersion = '1.3.0'
const localVersions = ['1.1.0', versionInUse, defaultVersion]
const versions = [...localVersions, '1.4.0', '1.5.0']

describe('Util functions', () => {
    it('Returns same number of versions passed to printVersion function', () => {
        const versionsObject = printVersions({ list: versions, versionInUse })
        expect(Object.keys(versionsObject)).toHaveLength(versions.length)
    })

    it('Highlights the version currently in use', () => {
        const versionsObject = printVersions({ list: versions, versionInUse })
        expect(versionsObject[versionInUse]).toBeDefined()
        expect(versionsObject[versionInUse]).toContain(VERSION_IN_USE_SYMBOL)
    })

    it('Highlights the default version', () => {
        const versionsObject = printVersions({
            list: versions,
            versionInUse,
            defaultVersion,
        })
        expect(versionsObject[defaultVersion]).toBeDefined()
        expect(versionsObject[defaultVersion]).toContain(DEFAULT_VERSION_TEXT)
    })

    it('Highlights all installed versions', () => {
        const versionsObject = printVersions({
            list: versions,
            versionInUse,
            defaultVersion,
            localVersions,
        })
        localVersions
            .filter(v => v !== versionInUse)
            .forEach(v => {
                expect(versionsObject[v]).toBeDefined()
                expect(versionsObject[v]).toContain(VERSION_INSTALLED_SYMBOL)
            })
    })
})
