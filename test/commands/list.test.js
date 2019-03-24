import fs from 'fs-extra'

import * as version from '../../src/util/version'
const printVersions = jest.spyOn(version, 'printVersions')
import {
    getExtractionPath,
    stripVersionPrefix,
    versionRootPath,
} from '../../src/util/utils'
import { listVersions } from '../../src/commands/list'

describe('yvm list', () => {
    const garbageInDirectory = ['haxor']
    const rootPath = '/tmp/yvmList'
    const versionsInDirectory = ['1.6.0', '1.7.0']

    const getList = async () => {
        const versionsInDirectory = ['1.6.0', '1.7.0']
        versionsInDirectory.forEach(version => {
            fs.mkdirsSync(getExtractionPath(version, rootPath))
        })
        garbageInDirectory.forEach(trash => {
            fs.mkdirsSync(getExtractionPath(trash, rootPath))
        })
        return (await listVersions(rootPath)).map(stripVersionPrefix)
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
        expect(listOutput).toHaveLength(2)
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
        const versionInUse = await version.getVersionInUse()
        const list = await getList()
        expect(printVersions).toHaveBeenCalledWith(
            expect.objectContaining({
                list,
                versionInUse,
            }),
        )
    })

    it('Returns nothing if nothing installed', async () => {
        const versions = await listVersions(rootPath)
        expect(versions).toEqual([])
        expect(printVersions).not.toHaveBeenCalled()
    })
})
