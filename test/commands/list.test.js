import { vol } from 'memfs'

import { yvmPath as rootPath } from 'util/path'
import { getExtractionPath } from 'util/utils'
import * as version from 'util/version'
const getVersionInUse = jest.spyOn(version, 'getVersionInUse')
const printVersions = jest.spyOn(version, 'printVersions')
import { list } from 'commands/list'

jest.mock('util/path', () => ({
    yvmPath: '/tmp/cmd/list/yvm',
    getPathEntries: () => [],
}))

describe('yvm list', () => {
    const versionsInDirectory = ['1.6.0', '1.7.0']

    beforeEach(() => {
        vol.fromJSON({
            [getExtractionPath('1.6.0', rootPath)]: {},
            [getExtractionPath('1.7.0', rootPath)]: {},
            [getExtractionPath('haxor', rootPath)]: {},
        })
    })

    afterEach(() => {
        vol.reset()
        printVersions.mockReset()
        version.getYarnVersions.cache.clear()
    })

    it('Lists only yarn versions in the installation directory', async () => {
        expect(await list()).toBe(0)
        expect(printVersions).toHaveBeenCalledWith(
            expect.objectContaining({
                list: versionsInDirectory,
            }),
        )
    })

    it('Correctly passes active yarn version', async () => {
        const versionInUse = await version.getVersionInUse()
        expect(await list()).toBe(0)
        expect(printVersions).toHaveBeenCalledWith(
            expect.objectContaining({
                list: versionsInDirectory,
                versionInUse,
            }),
        )
    })

    it('Prints nothing if nothing installed', async () => {
        expect(await list()).toBe(0)
        expect(printVersions).not.toHaveBeenCalled()
    })

    it('Handles failures', async () => {
        getVersionInUse.mockRejectedValueOnce(new Error('mock error'))
        expect(await list()).toBe(2)
    })
})
