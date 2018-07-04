const fs = require('fs-extra')

const exec = require('../../src/yvm-exec')
const { getExtractionPath, versionRootPath } = require('../../src/common/utils')

// TODO implement tests here once the "strict mode" stuff works on jest (ie require(yarn cli.js) fails)
describe.skip('yvm exec', () => {
    const rootPath = '/tmp/yvmExec'

    beforeAll(() => {
        fs.mkdirp(rootPath)
    })

    afterEach(() => {
        fs.removeSync(versionRootPath(rootPath))
    })

    it('Installs a valid yarn version if it isnt found', () => {
        const version = '1.7.0'
        const extraArgs = ['-v']
        return exec(version, extraArgs, rootPath).then(() => {
            expect(
                fs.statSync(getExtractionPath(version, rootPath)),
            ).toBeTruthy()
        })
    })
})
