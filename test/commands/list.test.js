const fs = require('fs-extra')

const list = require('../../src/commands/list')
const {
    getExtractionPath,
    printVersions,
    stripVersionPrefix,
    versionRootPath,
} = require('../../src/util/utils')

describe('yvm list', () => {
    const garbageInDirectory = ['haxor']
    const rootPath = '/tmp/yvmList'
    const versionsInDirectory = ['1.6.0', '1.7.0']

    const getList = () => {
        const versionsInDirectory = ['1.6.0', '1.7.0']
        versionsInDirectory.forEach(version => {
            fs.mkdirsSync(getExtractionPath(version, rootPath))
        })
        garbageInDirectory.forEach(trash => {
            fs.mkdirsSync(getExtractionPath(trash, rootPath))
        })
        return list(rootPath).map(stripVersionPrefix)
    }

    beforeAll(() => {
        fs.mkdirsSync(rootPath)
    })

    afterEach(() => {
        fs.removeSync(versionRootPath(rootPath))
    })

    it('Lists only yarn versions in the installation directory', () => {
        const listOutput = getList()
        expect(listOutput).toHaveLength(2)
        versionsInDirectory.forEach(item => {
            expect(listOutput.indexOf(item)).toBeGreaterThan(-1)
        })
        garbageInDirectory.forEach(item => {
            expect(listOutput.indexOf(item)).toBe(-1)
        })
    })

    it('Correctly highlights active yarn version', () => {
        const listOutput = getList()
        const versionsMap = printVersions({
            list: listOutput,
            message: 'test',
            versionInUse: '1.7.0',
        })
        expect(versionsMap['1.7.0']).toContain(` \u2713 1.7.0`)
        expect(versionsMap['1.6.0']).toContain(` - 1.6.0`)
    })

    it('Returns nothing if nothing installed', () => {
        const versions = list(rootPath)
        expect(versions).toEqual([])
    })
})
