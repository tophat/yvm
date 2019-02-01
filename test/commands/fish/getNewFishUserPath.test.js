const getNewFishUserPath = require('../../../src/commands/fish/getNewFishUserPath')

const FISH_ARRAY_DELIMINATOR = ' '

describe('getNewFishUserPath', () => {
    it('Returns a new fish_user_path string with a yarn directory prepended', () => {
        const mockVersion = '1.7.0'
        const mockRootPath = '/some/path'
        const mockSplitPath = ['abc', 'def']
        const mockPathString = mockSplitPath.join(FISH_ARRAY_DELIMINATOR)

        const expectedPathString = [
            `${mockRootPath}/versions/v${mockVersion}/bin`,
            ...mockSplitPath,
        ].join(FISH_ARRAY_DELIMINATOR)
        expect(
            getNewFishUserPath(mockVersion, mockRootPath, mockPathString),
        ).toEqual(expectedPathString)
    })

    it('Returns a new fish_user_path string with the yarn dir edited if it was already present', () => {
        const mockVersion = '1.7.0'
        const mockRootPath = '/some/path'
        const mockSplitPath = [
            'abc',
            `${mockRootPath}/versions/v1.6.0/bin`,
            'def',
        ]
        const mockPathString = mockSplitPath.join(FISH_ARRAY_DELIMINATOR)

        const expectedPathString = [
            'abc',
            `${mockRootPath}/versions/v${mockVersion}/bin`,
            'def',
        ].join(FISH_ARRAY_DELIMINATOR)
        expect(
            getNewFishUserPath(mockVersion, mockRootPath, mockPathString),
        ).toEqual(expectedPathString)
    })
})
