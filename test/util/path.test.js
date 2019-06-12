import mockProps from 'jest-mock-props'
mockProps.extend(jest)

import {
    getNonYvmPathEntries,
    getNonYvmShimPathEntries,
    getNonYvmVersionPathEntries,
    getPathEntries,
    toPathString,
    yvmPath,
} from 'util/path'

afterAll(jest.restoreAllMocks)

describe('util.path', () => {
    const mockShimPath = `${yvmPath}/shim`
    const mockVersionPath = `${yvmPath}/versions/v1.7.0/bin`
    const mockSystemPaths = ['/path/one', '/some/other/path', '/some/new/path']
    const mockPathEntries = [mockShimPath, mockVersionPath, ...mockSystemPaths]

    jest.spyOnProp(process.env, 'PATH').mockValue(
        toPathString({
            paths: mockPathEntries,
        }),
    )
    jest.spyOnProp(process.env, 'fish_user_paths').mockValue(
        toPathString({
            shell: 'fish',
            paths: mockPathEntries,
        }),
    )

    describe('toPathString', () => {
        it.each([['bash', ':'], ['fish', ' ']])(
            'builds correct path string for %s shell',
            (shell, delimiter) => {
                expect(toPathString({ shell, paths: mockPathEntries })).toEqual(
                    mockPathEntries.join(delimiter),
                )
            },
        )
    })

    describe('getPathEntries', () => {
        it.each(['bash', 'fish'].map(Array))(
            'gets path entries for %s shell',
            shell => {
                expect(getPathEntries(shell)).toEqual(mockPathEntries)
            },
        )
    })

    describe('getNonYvmPathEntries', () => {
        it('strips out yvm paths', () => {
            expect(getNonYvmPathEntries()).toEqual(mockSystemPaths)
        })
    })

    describe('getNonYvmVersionPathEntries', () => {
        it('strips out only yvm version paths', () => {
            expect(getNonYvmVersionPathEntries({})).toEqual([
                mockShimPath,
                ...mockSystemPaths,
            ])
        })
    })

    describe('getNonYvmShimPathEntries', () => {
        it('strips out only yvm shim path', () => {
            expect(getNonYvmShimPathEntries()).toEqual([
                mockVersionPath,
                ...mockSystemPaths,
            ])
        })
    })
})
