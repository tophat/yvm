const path = require('path')

const getNewPath = require('../../src/commands/getNewPath')

describe('getNewPath', () => {
    it('Returns a new PATH string with a yarn directory prepended', () => {
        const mockVersion = '1.7.0'
        const mockRootPath = '/some/path'
        const mockSplitPath = ['abc', 'def']
        const mockPathString = mockSplitPath.join(path.delimiter)

        const expectedPathString = [
            `${mockRootPath}/versions/v${mockVersion}/bin`,
            ...mockSplitPath,
        ].join(path.delimiter)
        expect(getNewPath(mockVersion, mockRootPath, mockPathString)).toEqual(
            expectedPathString,
        )
    })

    it('Returns a new PATH string with they yarn dir edited if it was already present', () => {
        const mockVersion = '1.7.0'
        const mockRootPath = '/some/path'
        const mockSplitPath = [
            'abc',
            `${mockRootPath}/versions/v1.6.0/bin`,
            'def',
        ]
        const mockPathString = mockSplitPath.join(path.delimiter)

        const expectedPathString = [
            'abc',
            `${mockRootPath}/versions/v${mockVersion}/bin`,
            'def',
        ].join(path.delimiter)
        expect(getNewPath(mockVersion, mockRootPath, mockPathString)).toEqual(
            expectedPathString,
        )
    })
})
