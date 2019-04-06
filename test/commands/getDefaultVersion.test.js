import log from '../../src/util/log'
import * as version from '../../src/util/version'
const getDefault = jest.spyOn(version, 'getDefaultVersion')
import { getDefaultVersion } from '../../src/commands/getDefaultVersion'

describe('unalias', () => {
    jest.spyOn(log, 'capturable')
    jest.spyOn(log, 'default')
    jest.spyOn(log, 'error')
    jest.spyOn(log, 'info')

    beforeEach(jest.clearAllMocks)
    afterAll(jest.restoreAllMocks)

    it('handles deleted aliases', async () => {
        getDefault.mockResolvedValueOnce('1.4.0')
        expect(await getDefaultVersion()).toBe(0)
        expect(log.capturable).toHaveBeenCalledWith('1.4.0')
    })

    it('handles no deleted aliases', async () => {
        getDefault.mockResolvedValueOnce(null)
        expect(await getDefaultVersion()).toBe(1)
        expect(log.default).toHaveBeenCalledWith(
            expect.stringContaining('No default yarn version'),
        )
    })

    it('handles unset error', async () => {
        const mockError = new Error('some message')
        getDefault.mockRejectedValueOnce(mockError)
        expect(await getDefaultVersion()).toBe(2)
        expect(log.error).toHaveBeenCalledWith(mockError.message)
        expect(log.info).toHaveBeenCalledWith(mockError.stack)
    })
})
