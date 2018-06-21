console.log(process.version)
console.error(process.version)

const fs = require('fs-extra')
const path = require('path')

const exec = require('../../src/commands/exec')
const { getExtractionPath, versionRootPath } = require('../../src/common/utils')

describe.only('yvm exec', () => {
    const rootPath = '/tmp/yvmExec'

    // beforeAll(()=>{
    //     fs.mkdirp(rootPath)
    // })

    // afterEach(()=>{
    //     fs.removeSync(versionRootPath(rootPath))
    // })

    it('Installs a valid yarn version if it isnt found', () => {
        const version = '1.7.0'
        const command = '-v'
        return exec(version, command, rootPath).then(() => {
            //expect(fs.statSync(getExtractionPath(version, rootPath))).toBeTruthy()
        })
    })
})
