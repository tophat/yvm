const mockFS = require('mock-fs')
const { stripVersionPrefix } = require('../../src/util/utils')
const {
    getDefaultVersion,
    setDefaultVersion,
    isValidVersionString,
    getValidVersionString,
    getYarnVersions,
} = require('../../src/util/version')

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
