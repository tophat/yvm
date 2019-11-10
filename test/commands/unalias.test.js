import * as alias from 'util/alias'
import log from 'util/log'

import { unalias } from 'commands/unalias'

describe('unalias', () => {
    jest.spyOn(log, 'default')
    const unsetAlias = jest.spyOn(alias, 'unsetAlias')

    beforeEach(jest.clearAllMocks)
    afterAll(jest.restoreAllMocks)

    it('handles deleted aliases', async () => {
        unsetAlias.mockResolvedValueOnce(true)
        const args = { name: 'mock-name', force: false, recursive: true }
        expect(await unalias(args)).toBe(0)
        expect(unsetAlias).toHaveBeenCalledWith(args)
        expect(log.default).toHaveBeenCalledWith(
            expect.stringContaining('successfully deleted'),
        )
    })

    it('handles no deleted aliases', async () => {
        unsetAlias.mockResolvedValueOnce(false)
        const args = { name: 'mock-name', force: true, recursive: false }
        expect(await unalias(args)).toBe(1)
        expect(unsetAlias).toHaveBeenCalledWith(args)
        expect(log.default).not.toHaveBeenCalled()
    })

    it('handles unset error', async () => {
        unsetAlias.mockRejectedValueOnce(new Error('some message'))
        const args = { name: 'mock-name' }
        expect(await unalias(args)).toBe(2)
        expect(unsetAlias).toHaveBeenCalledWith(args)
        expect(log.default).toHaveBeenCalledWith('some message')
    })
})
