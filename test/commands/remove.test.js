import path from 'path'
import { fs, vol } from 'memfs'

import log from 'util/log'
import { getExtractionPath, versionRootPath } from 'util/utils'
import * as version from 'util/version'
const getVersionInUse = jest.spyOn(version, 'getVersionInUse')
import { remove } from 'commands/remove'

describe('yvm remove', () => {
    const rootPath = '/tmp/yvmRemove'
    const versionRoot = versionRootPath(rootPath)
    const versionPath = version => path.resolve(versionRoot, `v${version}`)

    beforeAll(() => {
        jest.spyOn(log, 'default')
    })

    beforeEach(() => {
        vol.fromJSON({ [rootPath]: {} })
    })

    afterEach(() => {
        vol.reset()
        getVersionInUse.mockReset()
        jest.clearAllMocks()
    })

    afterAll(jest.restoreAllMocks)

    it('Removes installed version specified', async () => {
        const version = '1.7.0'
        getVersionInUse.mockReturnValue('')
        const versionInstallationPath = getExtractionPath(version, rootPath)
        vol.fromJSON({ [versionInstallationPath]: {} })
        expect(await remove(version, rootPath)).toBe(0)
        expect(fs.existsSync(versionPath(version))).toBe(false)
        expect(log.default).toHaveBeenCalledWith(
            expect.stringContaining('Successfully removed yarn v1.7.0'),
        )
    })

    it('Does not removes currently active version', async () => {
        const version = '1.7.0'
        getVersionInUse.mockReturnValue(version)
        const versionInstallationPath = getExtractionPath(version, rootPath)
        vol.fromJSON({ [versionInstallationPath]: {} })
        expect(await remove(version, rootPath)).toBe(1)
        expect(fs.existsSync(versionPath(version))).toBe(true)
        expect(log.default).toHaveBeenCalledWith(
            expect.stringContaining(
                'You cannot remove currently-active version',
            ),
        )
    })

    it('Handles not installed version', async () => {
        const version = '1.7.0'
        getVersionInUse.mockReturnValue('')
        expect(fs.existsSync(versionPath(version))).toBe(false)
        expect(await remove(version, rootPath)).toBe(1)
        expect(log.default).toHaveBeenCalledWith(
            expect.stringContaining('Yarn version 1.7.0 not found'),
        )
    })
})
