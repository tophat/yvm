const fs = require('fs-extra')

const remove = require('../../src/commands/remove')
const { getExtractionPath, versionRootPath } = require('../../src/common/utils')

describe('yvm remove', () => {
    const rootPath = '/tmp/yvmRemove'

    beforeAll(() => {
        fs.mkdirsSync(rootPath)
    })

    afterEach(() => {
        fs.removeSync(versionRootPath(rootPath))
    })

    it('Removes installed version specified', () => {
        const version = '1.7.0'
        const versionInstallationPath = getExtractionPath(version, rootPath)
        fs.mkdirsSync(versionInstallationPath)
        remove(version, rootPath)
        expect(
            fs.readdirSync(versionRootPath(rootPath)).indexOf(`v${version}`),
        ).toBe(-1)
    })
})
