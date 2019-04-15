import log from 'util/log'
import { listRemote } from 'commands/listRemote'
import { getVersionsFromTags } from 'util/utils'
import { getVersionInUse, printVersions } from 'util/version'

jest.mock('util/version', () => {
    const MOCK_CURRENT_VERSION = '1.0.0'
    const MOCK_LOCAL_VERSIONS = ['1.0.0', '1.6.0']
    return {
        getVersionInUse: jest.fn().mockImplementation(async () => {
            return MOCK_CURRENT_VERSION
        }),
        getYarnVersions: jest.fn().mockImplementation(() => {
            return MOCK_LOCAL_VERSIONS
        }),
        printVersions: jest.fn(),
    }
})
jest.mock('util/utils', () => {
    const MOCK_REMOTE_VERSIONS = ['1.0.0', '1.6.0', '1.7.0']
    return {
        getVersionsFromTags: jest.fn().mockImplementation(async () => {
            return MOCK_REMOTE_VERSIONS
        }),
    }
})

describe('yvm list-remote', () => {
    beforeAll(() => {
        jest.spyOn(log, 'default')
    })
    beforeEach(jest.clearAllMocks)
    afterAll(jest.restoreAllMocks)

    it('lists the response from the API', async () => {
        expect(await listRemote()).toEqual(0)
        expect(getVersionInUse).toHaveBeenCalled()
        expect(getVersionsFromTags).toHaveBeenCalled()
        const callArgs = printVersions.mock.calls[0][0]
        expect(callArgs.list).toEqual(['1.0.0', '1.6.0', '1.7.0'])
        expect(callArgs.localVersions).toEqual(['1.0.0', '1.6.0'])
        expect(callArgs.versionInUse).toEqual('1.0.0')
    })

    it('prints error if any fail', async () => {
        printVersions.mockRejectedValue(new Error('mock error'))
        expect(await listRemote()).toEqual(1)
        expect(log.default).toHaveBeenCalledWith('mock error')
    })

    it('prints error when no remote version available', async () => {
        getVersionsFromTags.mockResolvedValue([])
        expect(await listRemote()).toEqual(1)
        expect(log.default).toHaveBeenCalledWith(
            expect.stringContaining('No versions available'),
        )
    })
})
