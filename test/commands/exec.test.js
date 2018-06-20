const fs = require('fs-extra')
const path = require('path')

const exec = require('../../src/commands/exec')
const { getExtractionPath, versionRootPath } = require('../../src/common/utils')

describe('yvm exec', () => {
    it('Installs a valid yarn version if it isnt found', () => {
        const version = '1.7.0'
        const command = 'versions'
        return exec(version, command).then(() => {
            expect(fs.existsSync(getExtractionPath(version))).toBeTruthy()
        })
    })
})
