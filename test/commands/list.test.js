const fs = require('fs-extra')

const list = require('../../src/commands/list')
const {
    getExtractionPath,
    stripVersionPrefix,
    versionRootPath,
} = require('../../src/util/utils')

describe('yvm list', () => {
    const rootPath = '/tmp/yvmList'

    beforeAll(() => {
        fs.mkdirsSync(rootPath)
    })

    afterEach(() => {
        fs.removeSync(versionRootPath(rootPath))
    })

    it('Lists only yarn versions in the installation directory', () => {
        const versionsInDirectory = ['1.6.0', '1.7.0']
        versionsInDirectory.forEach(version => {
            fs.mkdirsSync(getExtractionPath(version, rootPath))
        })
        const garbageInDirectory = ['haxor']
        garbageInDirectory.forEach(trash => {
            fs.mkdirsSync(getExtractionPath(trash, rootPath))
        })
        const listOutput = list(rootPath).map(stripVersionPrefix)
        expect(listOutput).toHaveLength(2)
        versionsInDirectory.forEach(item => {
            expect(listOutput.indexOf(item)).toBeGreaterThan(-1)
        })
        garbageInDirectory.forEach(item => {
            expect(listOutput.indexOf(item)).toBe(-1)
        })
    })
})
