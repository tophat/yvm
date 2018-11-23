const fs = require('fs')
const which = require('../../src/commands/which')

describe('yvm which command', () => {
    it('fails to find yarn version if none installed', () => {
        const path = '/Users/tophat/.nvm/versions/node/v6.11.5/bin:'
        expect(which(path)).toBe(2)
    })
    it('Succeeds if yvm version matches .yvmrc', () => {
        const version = fs.readFileSync('.yvmrc', 'utf8')
        const path = `/Users/tophat/.yvm/versions/v${version}/bin:`
        const testPath = '/Users/tophat/.yvm'
        expect(which(path, testPath)).toBe(0)
    })
    it('Succeeds if yvm version does not match .yvmrc', () => {
        const path = '/Users/tophat/.yvm/versions/v0.0.0/bin:'
        const testPath = '/Users/tophat/.yvm'
        expect(which(path, testPath)).toBe(0)
    })
})
