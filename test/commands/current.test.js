const fs = require('fs')
const path = require('../../src/util/path')
path.yvmPath = '/Users/tophat/.yvm'
const version = require('../../src/util/version')
const getVersionInUse = jest
    .spyOn(version, 'getVersionInUse')
    .mockResolvedValue('1.7.0')
const current = require('../../src/commands/current')
const log = require('../../src/util/log')

jest.mock('../../src/util/log')

describe('yvm current command', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })
    afterAll(() => {
        jest.restoreAllMocks()
    })
    it('fails if yarn not installed and active', async () => {
        getVersionInUse.mockResolvedValueOnce('')
        const path = '/Users/tophat/.nvm/versions/node/v6.11.5/bin:'
        expect(await current({ path })).toBe(1)
        expect(log).toHaveBeenCalledWith(
            expect.stringContaining(`yarn is NOT installed`),
        )
    })
    it('fails if environment path is not available', async () => {
        const oldPath = process.env.PATH
        delete process.env.PATH
        expect(await current()).toBe(1)
        expect(log).toHaveBeenCalledWith(
            expect.stringContaining(`PATH not found`),
        )
        process.env.PATH = oldPath
    })
    it('fails if fish environment path is not available', async () => {
        const oldFishPath = process.env.FISH_USER_PATHS
        delete process.env.FISH_USER_PATHS
        expect(await current({ shell: 'fish' })).toBe(1)
        expect(log).toHaveBeenCalledWith(
            expect.stringContaining(`PATH not found`),
        )
        process.env.FISH_USER_PATHS = oldFishPath
    })
    it('fails to find yarn version if yvm not installed', async () => {
        const path = '/Users/tophat/.nvm/versions/node/v6.11.5/bin:'
        expect(await current({ path })).toBe(2)
        expect(log).toHaveBeenCalledWith(
            expect.stringContaining(`Yarn was NOT installed by yvm`),
        )
    })
    it('Succeeds if yvm version matches .yvmrc', async () => {
        const version = fs.readFileSync('.yvmrc', 'utf8')
        const path = `/Users/tophat/.yvm/versions/v${version}/bin:`
        expect(await current({ path })).toBe(0)
        expect(log).toHaveBeenCalledWith(
            expect.stringContaining(`version matches your PATH version`),
        )
    })
    it('Succeeds if yvm version does not match .yvmrc', async () => {
        const path = '/Users/tophat/.yvm/versions/v0.0.0/bin:'
        expect(await current({ path })).toBe(0)
        expect(log).toHaveBeenCalledWith(expect.stringContaining(`don't match`))
    })
})
