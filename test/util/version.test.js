const mockFS = require('mock-fs')
const {
    getDefaultVersion,
    setDefaultVersion,
    isValidVersionString,
    getValidVersionString,
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
    })

    it('Invalid versions', () => {
        expect(isValidVersionString('1.9.x')).toBe(false)
        expect(isValidVersionString('1.9')).toBe(false)
    })

    it('Parse versions', () => {
        expect(getValidVersionString('1.9.0')).toBe('1.9.0')
        expect(getValidVersionString('v1.9.0')).toBe('1.9.0')
    })
})
