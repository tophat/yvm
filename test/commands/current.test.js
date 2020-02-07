import { vol } from 'memfs'

import * as path from 'util/path'
import * as version from 'util/version'
import log from 'util/log'
import { current } from 'commands/current'

const getYarnPathEntries = jest.spyOn(path, 'getYarnPathEntries')
const isYvmPath = jest.spyOn(path, 'isYvmPath')
const getRcFileVersion = jest.spyOn(version, 'getRcFileVersion')
const getVersionInUse = jest.spyOn(version, 'getVersionInUse')

describe('yvm current command', () => {
    const mockYvmPath = '/User/tophat/.yvm'
    jest.spyOn(log, 'default')

    beforeAll(() => {
        vol.fromJSON({ '.yvmrc': '1.13.0' })
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    afterAll(() => {
        jest.restoreAllMocks()
    })

    it('fails if yarn not installed and active', async () => {
        getVersionInUse.mockResolvedValueOnce('')
        expect(await current()).toBe(1)
        expect(log.default).toHaveBeenCalledWith(
            expect.stringContaining('yarn is NOT installed'),
        )
    })

    it('fails to find yarn version if yvm not installed', async () => {
        getVersionInUse.mockResolvedValueOnce('1.17.0')
        getYarnPathEntries.mockReturnValueOnce(['/usr/local/bin/yarn'])
        expect(await current()).toBe(2)
        expect(log.default).toHaveBeenCalledWith(
            expect.stringContaining('Yarn was NOT installed by yvm'),
        )
    })

    it.each([
        ['1.13.0', '1.13.0'],
        ['>=1.16.0', '1.17.0'],
        ['^1.18.0', '1.19.2'],
    ])(
        'Succeeds if yvm yarn version matches yvm config version',
        async (rcVersion, version) => {
            isYvmPath.mockReturnValueOnce(true)
            getRcFileVersion.mockReturnValueOnce(rcVersion)
            getVersionInUse.mockResolvedValueOnce(version)
            getYarnPathEntries.mockReturnValueOnce([
                `${mockYvmPath}/versions/v${version}/bin`,
            ])
            expect(await current()).toBe(0)
            expect(log.default).toHaveBeenCalledWith(
                expect.stringContaining('version matches your PATH version'),
            )
        },
    )

    it.each([
        ['1.13.0', '1.12.0'],
        ['>=1.16.0', '1.15.0'],
        ['^1.18.0', '2.0.0'],
    ])(
        'Succeeds even if yarn version does not match config version',
        async (rcVersion, version) => {
            isYvmPath.mockReturnValueOnce(true)
            getRcFileVersion.mockReturnValueOnce(rcVersion)
            getVersionInUse.mockResolvedValueOnce(version)
            getYarnPathEntries.mockReturnValueOnce([
                `${mockYvmPath}/versions/v${version}/bin`,
            ])
            expect(await current()).toBe(0)
            expect(log.default).toHaveBeenCalledWith(
                expect.stringContaining("don't match"),
            )
        },
    )
})
