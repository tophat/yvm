const fs = require('fs-extra')

const version = require('../../src/util/version')
const printVersions = jest.spyOn(version, 'printVersions')
const {
    getExtractionPath,
    stripVersionPrefix,
    versionRootPath,
} = require('../../src/util/utils')
const list = require('../../src/commands/list')

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
        return (await list(rootPath)).map(stripVersionPrefix)
    }

    beforeAll(() => {
        fs.mkdirsSync(rootPath)
    })

    afterEach(() => {
        fs.removeSync(versionRootPath(rootPath))
        printVersions.mockReset()
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
        const versions = await list(rootPath)
        expect(versions).toEqual([])
        expect(printVersions).not.toHaveBeenCalled()
    })
})
