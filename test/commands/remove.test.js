const path = require('path')
const fs = require('fs-extra')

const { getExtractionPath, versionRootPath } = require('../../src/util/utils')
const version = require('../../src/util/version')
const getVersionInUse = jest.spyOn(version, 'getVersionInUse')
const remove = require('../../src/commands/remove')

describe('yvm remove', () => {
    const rootPath = '/tmp/yvmRemove'
    const versionRoot = versionRootPath(rootPath)
    const versionPath = version => path.resolve(versionRoot, `v${version}`)

    beforeAll(() => {
        fs.mkdirsSync(rootPath)
    })

    afterEach(() => {
        fs.removeSync(versionRootPath(rootPath))
        getVersionInUse.mockReset()
    })

    it('Removes installed version specified', async () => {
        const version = '1.7.0'
        getVersionInUse.mockReturnValue('')
        const versionInstallationPath = getExtractionPath(version, rootPath)
        fs.mkdirsSync(versionInstallationPath)
        expect(await remove(version, rootPath)).toBe(0)
        expect(fs.existsSync(versionPath(version))).toBe(false)
    })

    it('Does not removes currently active version', async () => {
        const version = '1.7.0'
        getVersionInUse.mockReturnValue(version)
        const versionInstallationPath = getExtractionPath(version, rootPath)
        fs.mkdirsSync(versionInstallationPath)
        expect(await remove(version, rootPath)).toBe(1)
        expect(fs.existsSync(versionPath(version))).toBe(true)
    })
})
