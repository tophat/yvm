import log from '../../src/util/log'
import { listRemote } from '../../src/commands/listRemote'
import { getVersionsFromTags } from '../../src/util/utils'
import { getVersionInUse, printVersions } from '../../src/util/version'

jest.mock('../../src/util/version', () => {
    const MOCK_CURRENT_VERSION = '1.0.0'
    const MOCK_LOCAL_VERSIONS = ['1.0.0', '1.6.0']
    return {
        getVersionInUse: jest.fn().mockImplementation(async () => {
            return MOCK_CURRENT_VERSION
        }),
        getYarnVersions: jest.fn().mockImplementation(() => {
            return MOCK_LOCAL_VERSIONS
        }),
        printVersions: jest.fn().mockImplementation(() => {
            throw new Error('mock error')
        }),
    }
})
jest.mock('../../src/util/utils', () => {
    const MOCK_REMOTE_VERSIONS = ['1.0.0', '1.6.0', '1.7.0']
    return {
        getVersionsFromTags: jest.fn().mockImplementation(async () => {
            return MOCK_REMOTE_VERSIONS
        }),
    }
})

describe('yvm list-remote', () => {
    it('lists the response from the API', async () => {
        await listRemote()
        expect(getVersionInUse).toHaveBeenCalled()
        expect(getVersionsFromTags).toHaveBeenCalled()
        const callArgs = printVersions.mock.calls[0][0]
        expect(callArgs.list).toEqual(['1.0.0', '1.6.0', '1.7.0'])
        expect(callArgs.localVersions).toEqual(['1.0.0', '1.6.0'])
        expect(callArgs.versionInUse).toEqual('1.0.0')
    })

    it('prints error if any fail', async () => {
        jest.spyOn(log, 'default')
        await listRemote()
        expect(log.default).toHaveBeenCalledWith('mock error')
        log.default.mockRestore()
    })

    afterAll(() => {
        jest.clearMocks()
    })
})
