import { fs, vol } from 'memfs'
import * as path from 'util/path'
const getYarnPathEntries = jest.spyOn(path, 'getYarnPathEntries')
const isYvmPath = jest.spyOn(path, 'isYvmPath')
import * as version from 'util/version'
const getVersionInUse = jest
    .spyOn(version, 'getVersionInUse')
    .mockResolvedValue('1.7.0')
import { current } from 'commands/current'
import log from 'util/log'

describe('yvm current command', () => {
    const mockYvmPath = '/User/tophat/.yvm'
    jest.spyOn(log, 'default')

    beforeAll(() => {
        vol.fromJSON({
            '.yvmrc': '1.13.0',
        })
    })

    afterAll(() => {
        jest.restoreAllMocks()
        vol.reset()
    })

    it('fails if yarn not installed and active', async () => {
        getVersionInUse.mockResolvedValueOnce('')
        expect(await current()).toBe(1)
        expect(log.default).toHaveBeenCalledWith(
            expect.stringContaining(`yarn is NOT installed`),
        )
    })

    it('fails to find yarn version if yvm not installed', async () => {
        getYarnPathEntries.mockReturnValueOnce(['/usr/local/bin/yarn'])
        expect(await current()).toBe(2)
        expect(log.default).toHaveBeenCalledWith(
            expect.stringContaining(`Yarn was NOT installed by yvm`),
        )
    })

    it('Succeeds if yvm version matches .yvmrc', async () => {
        const version = fs.readFileSync('.yvmrc', 'utf8').trim()
        isYvmPath.mockReturnValueOnce(true)
        getVersionInUse.mockResolvedValueOnce(version)
        getYarnPathEntries.mockReturnValueOnce([
            `${mockYvmPath}/versions/v${version}/bin`,
        ])
        expect(await current()).toBe(0)
        expect(log.default).toHaveBeenCalledWith(
            expect.stringContaining(`version matches your PATH version`),
        )
    })

    it('Succeeds if yvm version does not match .yvmrc', async () => {
        isYvmPath.mockReturnValueOnce(true)
        getYarnPathEntries.mockReturnValueOnce([
            `${mockYvmPath}/versions/v0.0.0/bin`,
        ])
        expect(await current()).toBe(0)
        expect(log.default).toHaveBeenCalledWith(
            expect.stringContaining(`don't match`),
        )
    })
})
