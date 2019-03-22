const mockFS = require('mock-fs')
const childProcess = require('child_process')
const execSync = jest.spyOn(childProcess, 'execSync')

const alias = require('../../src/util/alias')
const log = require('../../src/util/log')
const path = require('../../src/util/path')
const { stripVersionPrefix } = require('../../src/util/utils')
const {
    getDefaultVersion,
    getSplitVersionAndArgs,
    getValidVersionString,
    getVersionFromRange,
    getVersionInUse,
    getYarnVersions,
    isValidVersionRange,
    isValidVersionString,
    resolveVersion,
    setDefaultVersion,
} = require('../../src/util/version')

describe('yvm default version', () => {
    const mockYVMDir = '/mock-yvm-root-dir'
    const defaultLog = jest.spyOn(log, 'default')
    jest.spyOn(log, 'error')
    jest.spyOn(log, 'info')
    const resolveReserved = jest.spyOn(alias, 'resolveReserved')
    beforeEach(() => {
        log() // see https://github.com/facebook/jest/issues/5792
        mockFS({
            [mockYVMDir]: {},
        })
        jest.clearAllMocks()
        resolveVersion.cache.clear()
        getVersionFromRange.cache.clear()
        alias.getUserAliases.cache.clear()
        alias.resolveAlias.cache.clear()
    })
    afterEach(mockFS.restore)
    afterAll(jest.restoreAllMocks)

    it('Logs failure to set default version', async () => {
        const mockVersion = '1.9.2'
        const someError = 'Can not set alias'
        jest.spyOn(alias, 'setAlias').mockRejectedValueOnce(someError)
        expect(
            await setDefaultVersion({
                version: mockVersion,
                yvmPath: mockYVMDir,
            }),
        ).toBe(false)
        expect(defaultLog).toHaveBeenCalledWith('Unable to set default version')
        expect(log.info).toHaveBeenCalledWith(someError)
    })

    it('Returns default version if one is set', async () => {
        const mockVersion = '1.9.2'
        await setDefaultVersion({
            version: mockVersion,
            yvmPath: mockYVMDir,
        })

        expect(await getDefaultVersion(mockYVMDir)).toEqual(mockVersion)
    })

    it('Returns stable version if default is not set', async () => {
        resolveReserved.mockResolvedValue('1.12.0')
        expect(await getDefaultVersion(mockYVMDir)).toEqual('1.12.0')
    })

    it('Logs failure to get default version', async () => {
        const someError = 'Can not get alias'
        jest.spyOn(alias, 'resolveAlias').mockRejectedValueOnce(someError)
        expect(await getDefaultVersion(mockYVMDir)).toBeUndefined()
        expect(log.info).toHaveBeenCalledWith(someError)
    })
})

describe('yvm config version', () => {
    const mockRC = versionString => {
        mockFS({
            '.yvmrc': versionString,
        })
    }

    beforeEach(() => log())
    afterEach(() => {
        jest.clearAllMocks()
        mockFS.restore()
    })

    it('Uses supplied version if valid', async () => {
        const version = '1.9.4'
        const [parsedVersion] = await getSplitVersionAndArgs(`v${version}`)
        expect(parsedVersion).toEqual(version)
    })
    it('Uses valid version from config', async () => {
        mockRC('1.9.4')
        const [parsedVersion] = await getSplitVersionAndArgs()
        expect(parsedVersion).toEqual('1.9.4')
    })
    it('Uses valid range from config', async () => {
        mockRC(`'>=1.10.0 < 1.13'`)
        const [parsedVersion] = await getSplitVersionAndArgs()
        expect(parsedVersion).toEqual('1.12.3')
    })
    it('Logs error when supplied invalid version and uses config', async () => {
        jest.spyOn(log, 'info')
        mockRC('1.9.4')
        resolveVersion.cache.clear()
        const [parsedVersion] = await getSplitVersionAndArgs('va1.3.1')
        expect(log.info).toHaveBeenCalledWith(
            expect.stringContaining('Unable to resolve'),
        )
        expect(parsedVersion).toEqual('1.9.4')
    })
    it('Logs error when getting invalid version config', async () => {
        jest.spyOn(log, 'error')
        mockRC('va0.3.1')
        await getSplitVersionAndArgs().catch(() => {})
        expect(log.error).toHaveBeenCalledWith(
            expect.stringContaining('Unable to resolve'),
        )
    })
    it('Uses default version when no config available', async () => {
        const mockVersion = '1.9.2'
        mockFS({
            [path.yvmPath]: {},
        })
        await setDefaultVersion({
            version: mockVersion,
        })
        const [parsedVersion] = await getSplitVersionAndArgs()
        expect(parsedVersion).toEqual(mockVersion)
    })
    it('Throws error when unable to parse or find any version', async () => {
        jest.spyOn(log, 'error')
        mockRC('')
        try {
            await getSplitVersionAndArgs('va0.1.1')
        } catch (e) {
            expect(e.message).toEqual(
                expect.stringContaining('No yarn version supplied'),
            )
        }
    })
})

describe('yvm valid version', () => {
    it('Valid versions', () => {
        expect(isValidVersionString('1.9.2')).toBe(true)
        expect(isValidVersionString('v1.9.2')).toBe(true)
        expect(isValidVersionString('1.9.2 ')).toBe(true)
        expect(isValidVersionString('1.1.0-exp.2')).toBe(true)
    })

    it('Invalid versions', () => {
        expect(isValidVersionString('1.9.x')).toBe(false)
        expect(isValidVersionString('1.9')).toBe(false)
    })

    it('Parse versions', () => {
        expect(getValidVersionString('1.9.0')).toBe('1.9.0')
        expect(getValidVersionString('v1.9.0')).toBe('1.9.0')
        expect(getValidVersionString('v1.1.0-exp.2')).toBe('1.1.0-exp.2')
    })

    it('Valid version range', () => {
        expect(isValidVersionRange('1.9.2')).toBe(true)
        expect(isValidVersionRange('1.9.x')).toBe(true)
        expect(isValidVersionRange('1.9')).toBe(true)
        expect(isValidVersionRange('>=1.9 || <= 1.4.0')).toBe(true)
    })

    it('Accepts version range', async () => {
        expect(await getVersionFromRange('1.9.x')).toBe('1.9.4')
        expect(await getVersionFromRange('1.9')).toBe('1.9.4')
        expect(await getVersionFromRange('>=1.10.0 < 1.13')).toBe('1.12.3')
    })

    it.each([['^0.1.0'], ['~1.0.9'], ['~1.12.4'], ['~1.7.1']])(
        'Does not accept version range %s',
        async range => {
            try {
                const version = await getVersionFromRange(range)
                throw `Should have thrown error for '${range}', got '${version}' instead`
            } catch (e) {
                expect(e).toMatchSnapshot()
            }
        },
    )
})

describe('yvm installed versions', () => {
    const mockValid = ['v1.1.1', 'v1.2.3', 'v12.11.10-test-b2']
    const mockInvalid = ['v1.0', 'v1.0-a', '1.1.2', 'va1.1.3']
    const mockYVMDir = '/mock-yvm-root-dir'
    const mockYVMDirContents = {
        versions: [...mockValid, ...mockInvalid].reduce(
            (a, v) => Object.assign(a, { [v]: {} }),
            {},
        ),
    }
    beforeEach(() => {
        log()
        mockFS({ [mockYVMDir]: mockYVMDirContents })
    })
    afterEach(mockFS.restore)

    it('Valid version folders', () => {
        const expectedVersions = mockValid.map(stripVersionPrefix)
        expect(getYarnVersions(mockYVMDir)).toEqual(expectedVersions)
    })
})

describe('yarn version in use', () => {
    it('gets active version', async () => {
        execSync.mockReturnValueOnce('  1.7.0  ')
        getVersionInUse.cache.clear()
        expect(await getVersionInUse()).toEqual('1.7.0')
    })

    it('returns empty string on failure', async () => {
        execSync.mockImplementationOnce(() => {
            throw 'some error'
        })
        getVersionInUse.cache.clear()
        expect(await getVersionInUse()).toEqual('')
    })
})
