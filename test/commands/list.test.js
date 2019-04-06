import fs from 'fs-extra'

import { yvmPath as rootPath } from '../../src/util/path'
import { getExtractionPath, versionRootPath } from '../../src/util/utils'
import * as version from '../../src/util/version'
const getVersionInUse = jest.spyOn(version, 'getVersionInUse')
const printVersions = jest.spyOn(version, 'printVersions')
import { list } from '../../src/commands/list'

jest.mock('../../src/util/path', () => ({
    yvmPath: '/tmp/yvmInstall',
    getPathEntries: () => [],
}))

describe('yvm list', () => {
    const garbageInDirectory = ['haxor']
    const versionsInDirectory = ['1.6.0', '1.7.0']

    const getList = async () => {
        versionsInDirectory.forEach(version => {
            fs.mkdirsSync(getExtractionPath(version, rootPath))
        })
        garbageInDirectory.forEach(trash => {
            fs.mkdirsSync(getExtractionPath(trash, rootPath))
        })
        return versionsInDirectory
    }

    beforeAll(() => {
        fs.mkdirsSync(rootPath)
    })

    afterEach(() => {
        fs.removeSync(versionRootPath(rootPath))
        printVersions.mockReset()
        version.getYarnVersions.cache.clear()
    })

    it('Lists only yarn versions in the installation directory', async () => {
        const listOutput = await getList()
        expect(await list()).toBe(0)
        expect(printVersions).toHaveBeenCalledWith(
            expect.objectContaining({
                list: listOutput,
            }),
        )
        versionsInDirectory.forEach(item => {
            expect(listOutput.indexOf(item)).toBeGreaterThan(-1)
        })
        garbageInDirectory.forEach(item => {
            expect(listOutput.indexOf(item)).toBe(-1)
        })
    })

    it('Correctly passes active yarn version', async () => {
        const [versionInUse, listOutput] = await Promise.all([
            version.getVersionInUse(),
            getList(),
        ])
        expect(await list()).toBe(0)
        expect(printVersions).toHaveBeenCalledWith(
            expect.objectContaining({
                list: listOutput,
                versionInUse,
            }),
        )
    })

    it('Prints nothing if nothing installed', async () => {
        expect(await list()).toBe(0)
        expect(printVersions).not.toHaveBeenCalled()
    })

    it('Handles failures', async () => {
        await getList()
        getVersionInUse.mockRejectedValueOnce(new Error('mock error'))
        expect(await list()).toBe(2)
    })
})
