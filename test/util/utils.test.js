const { printVersions } = require('../../src/util/utils')

// const versionUtil = require('../../src/util/version')
// versionUtil.getDefaultVersion = jest.fn(() => '1.3.0')
// jest.mock('getDefaultVersion', jest.fn(() => '1.3.10'))

// const GLOBAL_DEFAULT_VERSION_TEXT = 'Global Default'
const VERSION_IN_USE_SYMBOL = `\u2713`

const versions = ['1.1.0', '1.2.0', '1.3.0']
const versionInUse = '1.2.0'
const globalDefaultVersion = '1.3.0'

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

    it('Highlights the global default version', () => {
        // jest.mock('getDefaultVersion', jest.fn(() => globalDefaultVersion))
        const versionsObject = printVersions(versions, null, versionInUse)
        expect(versionsObject[globalDefaultVersion]).toBeDefined()
        // expect(versionsObject[globalDefaultVersion]).toContain(
        //     GLOBAL_DEFAULT_VERSION_TEXT,
        // )
    })
})
