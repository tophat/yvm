const mockFS = require('mock-fs')
const childProcess = require('child_process')
const execSync = jest.spyOn(childProcess, 'execSync')
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
    setDefaultVersion,
} = require('../../src/util/version')

jest.mock('../../src/util/log')

describe('yvm default version', () => {
    const mockYVMDir = '/mock-yvm-root-dir'
    beforeEach(() => {
        mockFS({
            [mockYVMDir]: {},
        })
    })
    afterEach(mockFS.restore)

    it('Returns default version if one is set, when there is none', () => {
        const mockVersion = '1.32.34'
        setDefaultVersion({
            version: mockVersion,
            yvmPath: mockYVMDir,
        })

        expect(getDefaultVersion(mockYVMDir)).toEqual(mockVersion)
    })

    it('Returns no version if one is not set, when there is none', () => {
        expect(getDefaultVersion(mockYVMDir)).toBeUndefined()
    })
})

describe('yvm config version', () => {
    const NOOP = () => {}
    const mockRC = versionString => {
        mockFS({
            '.yvmrc': versionString,
        })
    }
    afterEach(() => {
        jest.resetAllMocks()
        mockFS.restore()
    })

    it('Uses supplied version if valid', async () => {
        const version = '1.1.1'
        const [parsedVersion] = await getSplitVersionAndArgs(`v${version}`)
        expect(parsedVersion).toEqual(version)
    })
    it('Uses valid version from config', async () => {
        mockRC('1.1.1')
        const [parsedVersion] = await getSplitVersionAndArgs()
        expect(parsedVersion).toEqual('1.1.1')
    })
    it('Uses valid range from config', async () => {
        mockRC(`'>=1.10.0 < 1.13'`)
        const [parsedVersion] = await getSplitVersionAndArgs()
        expect(parsedVersion).toEqual('1.12.3')
    })
    it('Logs error when getting invalid version config', async () => {
        jest.spyOn(process, 'exit').mockImplementation(NOOP)
        mockRC('va0.3.1')
        await getSplitVersionAndArgs()
        expect(log.error).toHaveBeenCalledWith(
            expect.stringContaining('Invalid yarn version'),
        )
        process.exit.mockRestore()
    })
    it('Uses default version when no config available', async () => {
        const mockVersion = '1.32.34'
        mockFS({
            [path.yvmPath]: {},
        })
        setDefaultVersion({
            version: mockVersion,
        })
        const [parsedVersion] = await getSplitVersionAndArgs()
        expect(parsedVersion).toEqual(mockVersion)
    })
    it('Logs error when no config or default version available', async () => {
        jest.spyOn(process, 'exit').mockImplementation(NOOP)
        mockFS({
            [path.yvmPath]: {},
        })
        await getSplitVersionAndArgs()
        expect(log.error).toHaveBeenCalledWith(
            expect.stringContaining('No yarn version supplied'),
        )
        process.exit.mockRestore()
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
    beforeEach(() => mockFS({ [mockYVMDir]: mockYVMDirContents }))
    afterEach(mockFS.restore)

    it('Valid version folders', () => {
        const expectedVersions = mockValid.map(stripVersionPrefix)
        expect(getYarnVersions(mockYVMDir)).toEqual(expectedVersions)
    })
})

describe('yarn version in use', () => {
    it('gets active version', async () => {
        execSync.mockReturnValueOnce('  1.7.0  ')
        expect(await getVersionInUse()).toEqual('1.7.0')
    })

    it('returns empty string on failure', async () => {
        execSync.mockImplementationOnce(() => {
            throw 'some error'
        })
        expect(await getVersionInUse()).toEqual('')
    })
})
