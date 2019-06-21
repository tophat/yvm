import { vol } from 'memfs'

import log from 'util/log'
import { yvmInstalledVersion } from 'util/yvmInstalledVersion'

describe('yvm installed version', () => {
    const mockYVMDir = '/mock-yvm-root-dir'
    jest.spyOn(log, 'default')

    beforeEach(jest.clearAllMocks)
    afterEach(() => vol.reset())
    afterAll(jest.restoreAllMocks)

    it('Finds version if installed', () => {
        const mockVersion = 'v1.2.3'
        vol.fromJSON({
            [mockYVMDir]: {
                '.version': `{ "version": "${mockVersion}" }`,
            },
        })
        expect(yvmInstalledVersion(mockYVMDir)).toEqual(mockVersion)
    })

    it('fails to find version if no file', () => {
        delete process.env.YVM_VERBOSE
        expect(yvmInstalledVersion(mockYVMDir)).toBeUndefined()
        expect(log.default).not.toHaveBeenCalled()
    })

    it('fails to find version if file does not contain valid json', () => {
        delete process.env.YVM_VERBOSE
        const mockVersion = 'v1.2.3'
        vol.fromJSON({
            [mockYVMDir]: {
                '.version': `{ "${mockVersion}" }`,
            },
        })
        expect(yvmInstalledVersion(mockYVMDir)).toBeUndefined()
        expect(log.default).not.toHaveBeenCalled()
    })

    it('fails to find version if file does not valid json with "version" key', () => {
        delete process.env.YVM_VERBOSE
        const mockVersion = 'v1.2.3'
        vol.fromJSON({
            [mockYVMDir]: {
                '.version': `{ "version_not_key": "${mockVersion}" }`,
            },
        })
        expect(yvmInstalledVersion(mockYVMDir)).toBeUndefined()
        expect(log.default).not.toHaveBeenCalled()
    })

    it('logs reason for failure if verbose is true', () => {
        process.env.YVM_VERBOSE = true
        expect(yvmInstalledVersion(mockYVMDir)).toBeUndefined()
        expect(log.default).toHaveBeenCalledTimes(1)
        expect(log.default.mock.calls[0]).toMatchSnapshot()
        delete process.env.YVM_VERBOSE
    })
})
