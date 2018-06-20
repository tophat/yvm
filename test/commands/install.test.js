const fs = require('fs-extra')
const path = require('path')

const install = require('../../src/commands/install')
const { getExtractionPath, versionRootPath } = require('../../src/common/utils')

describe('yvm install', () => {
    it('Installs a valid yarn version', () => {
        const version = '1.7.0'
        return install(version).then(() => {
            expect(fs.statSync(getExtractionPath(version))).toBeTruthy()
        })
    })

    it('Installs two versions of Yarn', () => {
        const v1 = '1.7.0'
        const v2 = '1.6.0'
        return Promise.all([install(v1), install(v2)]).then(() => {
            expect(fs.statSync(getExtractionPath(v1))).toBeTruthy()
            expect(fs.statSync(getExtractionPath(v2))).toBeTruthy()
        })
    })

    it('Installs doesnt install an invalid version of Yarn', () => {
        const version = '0.0.0'
        return install(version).catch(() => {
            expect(() => fs.statSync(getExtractionPath(version))).toThrow()
        })
    })
})
