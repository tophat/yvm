const { printVersions } = require('../../src/util/utils')

const DEFAULT_VERSION_TEXT = 'Global Default'
const VERSION_IN_USE_SYMBOL = `\u2713`

const versions = ['1.1.0', '1.2.0', '1.3.0']
const versionInUse = '1.2.0'
const defaultVersion = '1.3.0'

describe('Util functions', () => {
    it('Returns same number of versions passed to printVersion function', () => {
        const versionsObject = printVersions(versions, null, versionInUse)
        expect(Object.keys(versionsObject)).toHaveLength(versions.length)
    })

    it('Highlights the version currently in use', () => {
        const versionsObject = printVersions(versions, null, versionInUse)
        expect(versionsObject[versionInUse]).toBeDefined()
        expect(versionsObject[versionInUse]).toContain(VERSION_IN_USE_SYMBOL)
    })

    it('Highlights the  default version', () => {
        const versionsObject = printVersions(
            versions,
            null,
            versionInUse,
            defaultVersion,
        )
        expect(versionsObject[defaultVersion]).toBeDefined()
        expect(versionsObject[defaultVersion]).toContain(DEFAULT_VERSION_TEXT)
    })
})
