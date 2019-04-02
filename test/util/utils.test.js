import request from 'request'

import log from '../../src/util/log'
import {
    DEFAULT_VERSION_TEXT,
    VERSION_IN_USE_SYMBOL,
    VERSION_INSTALLED_SYMBOL,
    printVersions,
} from '../../src/util/version'
import {
    getReleasesFromTags,
    getRequest,
    getVersionsFromTags,
} from '../../src/util/utils'

const versionInUse = '1.2.0'
const defaultVersion = '1.3.0'
const localVersions = ['1.1.0', versionInUse, defaultVersion]
const versions = [...localVersions, '1.4.0', '1.5.0']

beforeAll(() => {
    jest.spyOn(log, 'default')
})
beforeEach(jest.clearAllMocks)
afterAll(jest.restoreAllMocks)

describe('getRequest', () => {
    beforeAll(() => {
        jest.spyOn(request, 'get')
    })
    afterAll(() => {
        request.get.mockRestore()
    })

    it('calls request with correct options', async () => {
        const url = 'https://some.url'
        await getRequest(url).catch(() => {})
        expect(request.get).toHaveBeenCalledWith(
            expect.objectContaining({
                url,
                gzip: true,
                headers: {
                    'User-Agent': 'YVM',
                },
            }),
            expect.any(Function),
        )
    })

    it('resolves with body if there is no error', async () => {
        const mockResponseBody = 'mock body'
        request.get.mockImplementationOnce((_, callback) => {
            callback(null, { statusCode: 200 }, mockResponseBody)
        })
        expect(await getRequest('https://any.url')).toEqual(mockResponseBody)
    })

    it('rejects with error if there is one', async () => {
        const mockError = new Error('mock error')
        request.get.mockImplementationOnce((_, callback) => {
            callback(mockError, null, null)
        })
        try {
            await getRequest('https://invalid.url')
        } catch (rejection) {
            expect(rejection).toBe(mockError)
        }
    })

    it('rejects with response body', async () => {
        const mockResponseBody = 'mock response body'
        request.get.mockImplementationOnce((_, callback) => {
            callback(null, { statusCode: 400, body: mockResponseBody })
        })
        try {
            await getRequest('https://wrong.url')
        } catch (rejection) {
            expect(log.default).not.toHaveBeenCalled()
            expect(rejection).toBe(mockResponseBody)
        }
    })

    it('rejects with response body and logs error', async () => {
        const mockError = new Error('mock error')
        const mockResponseBody = 'mock response body'
        request.get.mockImplementationOnce((_, callback) => {
            callback(mockError, { statusCode: 400, body: mockResponseBody })
        })
        try {
            await getRequest('https://wrong.invalid.url')
        } catch (rejection) {
            expect(log.default).toHaveBeenCalledWith(mockError)
            expect(rejection).toBe(mockResponseBody)
        }
    })
})

describe('getVersionsFromTags', () => {
    beforeAll(() => {
        jest.spyOn(log, 'error')
        jest.spyOn(request, 'get')
    })
    beforeEach(() => {
        getRequest.cache.clear()
        getReleasesFromTags.cache.clear()
        getVersionsFromTags.cache.clear()
    })

    it('gets version from tags', async () => {
        request.get.mockImplementationOnce((_, callback) => {
            const body = [
                {
                    name: 'v1.15.2',
                    zipball_url:
                        'https://api.github.com/repos/yarnpkg/yarn/zipball/v1.15.2',
                    tarball_url:
                        'https://api.github.com/repos/yarnpkg/yarn/tarball/v1.15.2',
                    commit: {
                        sha: '6065f7ac8f7cec2b2c35094788117be0deae2f37',
                        url:
                            'https://api.github.com/repos/yarnpkg/yarn/commits/6065f7ac8f7cec2b2c35094788117be0deae2f37',
                    },
                    node_id: 'MDM6UmVmNDk5NzA2NDI6djEuMTUuMg==',
                },
                {
                    name: 'v0.9.8',
                    zipball_url:
                        'https://api.github.com/repos/yarnpkg/yarn/zipball/v0.9.8',
                    tarball_url:
                        'https://api.github.com/repos/yarnpkg/yarn/tarball/v0.9.8',
                    commit: {
                        sha: 'mocksha',
                        url:
                            'https://api.github.com/repos/yarnpkg/yarn/commits/mockcommit',
                    },
                    node_id: 'mocknodeid==',
                },
            ]
            callback(null, { statusCode: 200 }, JSON.stringify(body))
        })
        expect(await getVersionsFromTags()).toEqual(['1.15.2'])
    })

    it('logs error and returns empty on failure', async () => {
        const mockError = new Error('mock error')
        request.get.mockImplementationOnce((_, callback) => {
            callback(mockError)
        })
        expect(await getVersionsFromTags()).toEqual([])
        expect(log.error).toHaveBeenCalledWith(
            expect.stringContaining('Unable to retrieve remote versions'),
        )
        expect(log.error).toHaveBeenCalledWith(
            expect.stringContaining('Please check your network connection'),
        )
    })
})

describe('printVersions', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })
    it('Prints all versions passed to printVersion function', async () => {
        const versionsObject = await printVersions({
            message: 'print all versions',
            list: versions,
        })
        expect(Object.keys(versionsObject)).toHaveLength(versions.length)
        expect(log.default.mock.calls).toMatchSnapshot()
    })

    it('Highlights the version currently in use', async () => {
        const versionsObject = await printVersions({
            message: 'highlight current version',
            list: versions,
            versionInUse,
        })
        expect(versionsObject[versionInUse]).toContain(versionInUse)
        expect(versionsObject[versionInUse]).toContain(VERSION_IN_USE_SYMBOL)
        expect(log.default.mock.calls).toMatchSnapshot()
    })

    it('Highlights the default version', async () => {
        const versionsObject = await printVersions({
            message: 'highlight default version',
            list: versions,
            versionInUse,
            defaultVersion,
        })
        expect(versionsObject[defaultVersion]).toContain(defaultVersion)
        expect(versionsObject[defaultVersion]).toContain(DEFAULT_VERSION_TEXT)
        expect(log.default.mock.calls).toMatchSnapshot()
    })

    it('Highlights all installed versions', async () => {
        const versionsObject = await printVersions({
            message: 'highlight installed versions',
            list: versions,
            versionInUse,
            defaultVersion,
            localVersions,
        })
        localVersions
            .filter(v => v !== versionInUse)
            .forEach(v => {
                expect(versionsObject[v]).toContain(v)
                expect(versionsObject[v]).toContain(VERSION_INSTALLED_SYMBOL)
            })
        expect(log.default.mock.calls).toMatchSnapshot()
    })
})
