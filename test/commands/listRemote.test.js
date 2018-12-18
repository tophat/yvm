const listRemote = require('../../src/commands/listRemote')
const { getVersionsFromTags } = require('../../src/util/utils')
const { getVersionInUse, printVersions } = require('../../src/util/version')

jest.mock('../../src/util/version', () => {
    const MOCK_CURRENT_VERSION = '1.0.0'
    return {
        getVersionInUse: jest.fn().mockImplementation(() => {
            return Promise.resolve(MOCK_CURRENT_VERSION)
        }),
        printVersions: jest.fn(),
    }
})
jest.mock('../../src/util/utils', () => {
    const MOCK_REMOTE_VERSIONS = ['1.0.0', '1.6.0']
    return {
        getVersionsFromTags: jest.fn().mockImplementation(() => {
            return Promise.resolve(MOCK_REMOTE_VERSIONS)
        }),
    }
})

describe('yvm list-remote', () => {
    it('lists the response from the API', () => {
        return listRemote().then(() => {
            expect(getVersionInUse).toHaveBeenCalled()
            expect(getVersionsFromTags).toHaveBeenCalled()
            const callArgs = printVersions.mock.calls[0][0]
            expect(callArgs.list).toEqual(['1.0.0', '1.6.0'])
            expect(callArgs.versionInUse).toEqual('1.0.0')
        })
    })

    afterAll(() => {
        jest.clearMocks()
    })
})
