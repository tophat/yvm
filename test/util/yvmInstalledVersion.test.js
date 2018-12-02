const mockFS = require('mock-fs')
const { yvmInstalledVersion } = require('../../src/util/yvmInstalledVersion')

describe('yvm installed version', () => {
    const mockYVMDir = '/mock-yvm-root-dir'
    afterEach(mockFS.restore)

    it('Finds version if installed', () => {
        const mockVersion = 'v1.2.3'
        mockFS({
            [mockYVMDir]: {
                '.version': `{ "version": "${mockVersion}" }`,
            },
        })
        expect(yvmInstalledVersion(mockYVMDir)).toEqual(mockVersion)
    })

    it('fails to find version if no file', () => {
        expect(yvmInstalledVersion(mockYVMDir)).toBeUndefined()
    })

    it('fails to find version if file does not contain valid json', () => {
        const mockVersion = 'v1.2.3'
        mockFS({
            [mockYVMDir]: {
                '.version': `{ "${mockVersion}" }`,
            },
        })
        expect(yvmInstalledVersion(mockYVMDir)).toBeUndefined()
    })

    it('fails to find version if file does not valid json with "version" key', () => {
        const mockVersion = 'v1.2.3'
        mockFS({
            [mockYVMDir]: {
                '.version': `{ "version_not_key": "${mockVersion}" }`,
            },
        })
        expect(yvmInstalledVersion(mockYVMDir)).toBeUndefined()
    })
})
