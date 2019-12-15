import mockProps from 'jest-mock-props'

mockProps.extend(jest)

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
        jest.spyOn(
            install,
            'ensureVersionInstalled',
        ).mockImplementation(() => {})
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
    beforeAll(() => jest.spyOnProp(process.env, 'PATH'))
    afterAll(jest.restoreAllMocks)

    it('Returns a new PATH string with a yarn directory prepended', () => {
        const mockVersion = '1.7.0'
        const mockRootPath = '/some/path'
        const mockSplitPath = ['abc', 'def']
        process.env.PATH = pathUtils.toPathString({
            paths: mockSplitPath,
        })

        const expectedPathString = pathUtils.toPathString({
            paths: [
                `${mockRootPath}/versions/v${mockVersion}/bin`,
                ...mockSplitPath,
            ],
        })
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
        process.env.PATH = pathUtils.toPathString({ paths: mockSplitPath })

        const expectedPathString = pathUtils.toPathString({
            paths: [
                `${mockRootPath}/versions/v${mockVersion}/bin`,
                'abc',
                'def',
            ],
        })
        expect(
            buildNewPath({
                version: mockVersion,
                rootPath: mockRootPath,
            }),
        ).toEqual(expectedPathString)
    })

    describe('fish', () => {
        const toPathString = paths =>
            pathUtils.toPathString({ shell: 'fish', paths })

        beforeAll(() => jest.spyOnProp(process.env, 'fish_user_paths'))

        it('Returns a new fish_user_path string with a yarn directory prepended', () => {
            const mockVersion = '1.7.0'
            const mockRootPath = '/some/path'
            const mockSplitPath = ['abc', 'def']
            process.env.fish_user_paths = toPathString(mockSplitPath)

            const expectedPathString = toPathString([
                `${mockRootPath}/versions/v${mockVersion}/bin`,
                ...mockSplitPath,
            ])
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
            process.env.fish_user_paths = toPathString(mockSplitPath)

            const expectedPathString = toPathString([
                `${mockRootPath}/versions/v${mockVersion}/bin`,
                'abc',
                'def',
            ])
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
