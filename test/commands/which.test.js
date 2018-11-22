const which = require('../../src/commands/which')

describe('yvm which command', () => {
    it('fails to find yarn version', () => {
        const path = '/Users/tophat/.nvm/versions/node/v6.11.5/bin:'
        expect(which(path)).toBe(2)
    })
})
