import path from 'path'

import log from 'util/log'
import * as pathUtils from 'util/path'
import * as version from 'util/version'
import * as install from 'commands/install'
import { buildNewPath, getNewPath } from 'commands/getNewPath'

describe('getNewPath', () => {
    const mockVersion = '1.13.0'
    beforeAll(() => {
        jest.spyOn(log, 'capturable')
        jest.spyOn(log, 'error')
        jest.spyOn(log, 'info')
        jest.spyOn(install, 'ensureVersionInstalled').mockImplementation(
            () => {},
        )
        jest.spyOn(version, 'getSplitVersionAndArgs').mockReturnValue([
            mockVersion,
        ])
    })
    beforeEach(jest.clearAllMocks)
    afterAll(jest.restoreAllMocks)

    it('outputs new path', async () => {
        const newPath = buildNewPath({ version: mockVersion })
        expect(await getNewPath(mockVersion)).toEqual(0)
        expect(log.capturable).toHaveBeenCalledWith(newPath)
    })

    it('error handles correctly', async () => {
        const mockError = new Error('mock error')
        install.ensureVersionInstalled.mockRejectedValueOnce(mockError)
        expect(await getNewPath(mockVersion)).toEqual(1)
        expect(log.error).toHaveBeenCalledWith(mockError.message)
        expect(log.info).toHaveBeenCalledWith(mockError.stack)
    })
})

describe('buildNewPath', () => {
    beforeAll(() => {
        jest.spyOn(pathUtils, 'getPathEntries')
    })
    afterAll(jest.restoreAllMocks)

    it('Returns a new PATH string with a yarn directory prepended', () => {
        const mockVersion = '1.7.0'
        const mockRootPath = '/some/path'
        const mockSplitPath = ['abc', 'def']
        pathUtils.getPathEntries.mockReturnValueOnce(mockSplitPath)

        const expectedPathString = [
            `${mockRootPath}/versions/v${mockVersion}/bin`,
            ...mockSplitPath,
        ].join(path.delimiter)
        expect(
            buildNewPath({
                version: mockVersion,
                rootPath: mockRootPath,
            }),
        ).toEqual(expectedPathString)
    })

    it('Returns a new PATH string with the yarn dir replaced if it was already present', () => {
        const mockVersion = '1.7.0'
        const mockRootPath = '/some/path'
        const mockSplitPath = [
            'abc',
            `${mockRootPath}/versions/v1.6.0/bin`,
            'def',
            `${mockRootPath}/versions/v1.5.0/bin`,
        ]
        pathUtils.getPathEntries.mockReturnValueOnce(mockSplitPath)

        const expectedPathString = [
            `${mockRootPath}/versions/v${mockVersion}/bin`,
            'abc',
            'def',
        ].join(path.delimiter)
        expect(
            buildNewPath({
                version: mockVersion,
                rootPath: mockRootPath,
            }),
        ).toEqual(expectedPathString)
    })

    describe('fish', () => {
        const FISH_ARRAY_DELIMITER = ' '
        it('Returns a new fish_user_path string with a yarn directory prepended', () => {
            const mockVersion = '1.7.0'
            const mockRootPath = '/some/path'
            const mockSplitPath = ['abc', 'def']
            pathUtils.getPathEntries.mockReturnValueOnce(mockSplitPath)

            const expectedPathString = [
                `${mockRootPath}/versions/v${mockVersion}/bin`,
                ...mockSplitPath,
            ].join(FISH_ARRAY_DELIMITER)
            expect(
                buildNewPath({
                    shell: 'fish',
                    version: mockVersion,
                    rootPath: mockRootPath,
                }),
            ).toEqual(expectedPathString)
        })

        it('Returns a new fish_user_path string with the yarn dir replaced if it was already present', () => {
            const mockVersion = '1.7.0'
            const mockRootPath = '/some/path'
            const mockSplitPath = [
                'abc',
                `${mockRootPath}/versions/v1.6.0/bin`,
                'def',
                `${mockRootPath}/versions/v1.5.0/bin`,
            ]
            pathUtils.getPathEntries.mockReturnValueOnce(mockSplitPath)

            const expectedPathString = [
                `${mockRootPath}/versions/v${mockVersion}/bin`,
                'abc',
                'def',
            ].join(FISH_ARRAY_DELIMITER)
            expect(
                buildNewPath({
                    shell: 'fish',
                    version: mockVersion,
                    rootPath: mockRootPath,
                }),
            ).toEqual(expectedPathString)
        })
    })
})
