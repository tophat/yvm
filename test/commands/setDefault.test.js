import log from 'util/log'
import * as version from 'util/version'

const setDefaultVersion = jest.spyOn(version, 'setDefaultVersion')
import { setDefault } from 'commands/setDefault'

describe('setDefault', () => {
    jest.spyOn(log, 'capturable')
    jest.spyOn(log, 'default')
    jest.spyOn(log, 'error')

    beforeEach(jest.clearAllMocks)
    afterAll(jest.restoreAllMocks)

    it('handles set default successful', async () => {
        const version = '1.4.0'
        setDefaultVersion.mockResolvedValueOnce(true)
        expect(await setDefault(version)).toBe(0)
        expect(setDefaultVersion).toHaveBeenCalledWith({ version })
        expect(log.default).toHaveBeenCalledWith(
            expect.stringContaining('Default version set'),
        )
    })

    it('handles set default unsuccessful', async () => {
        const version = '1.4.0'
        setDefaultVersion.mockResolvedValueOnce(false)
        expect(await setDefault(version)).toBe(1)
        expect(setDefaultVersion).toHaveBeenCalledWith({ version })
        expect(log.default).not.toHaveBeenCalled()
    })

    it('handles unset error', async () => {
        const mockError = new Error('some message')
        setDefaultVersion.mockRejectedValueOnce(mockError)
        const version = '1.4.0'
        expect(await setDefault(version)).toBe(2)
        expect(setDefaultVersion).toHaveBeenCalledWith({ version })
        expect(log.error).toHaveBeenCalledWith(mockError.message)
    })
})
