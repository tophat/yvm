import fs from 'fs-extra'
import path from 'path'

import { alias } from 'commands/alias'
import { STORAGE_FILE, getUserAliases } from 'util/alias'
import log from 'util/log'
import { yvmPath as rootPath } from 'util/path'
import * as utils from 'util/utils'
import * as version from 'util/version'

jest.mock('util/path', () => ({
    yvmPath: '/tmp/cmd/alias/yvm',
    getNonYvmYarnPathEntries: () => [],
}))

describe('alias', () => {
    const { resolveVersion } = version
    const currentYarnVersion = '1.15.2'
    const pinnedStableVersion = currentYarnVersion
    const installedYarnVersions = [currentYarnVersion, '1.13.0', '1.7.0']
    const allYarnVersions = [...installedYarnVersions, '1.6.0', '1.3.0']
    const mockAliases = {
        abc: 'b',
        bcd: 'z',
        xyz: '1.13',
    }

    const writeAliases = () => {
        const aliasFilePath = path.join(rootPath, STORAGE_FILE)
        fs.outputFileSync(aliasFilePath, JSON.stringify(mockAliases))
    }

    beforeAll(() => {
        jest.spyOn(version, 'resolveVersion').mockImplementation(
            async (...args) => {
                if (args[0].versionString === 'stable')
                    return pinnedStableVersion
                return resolveVersion(...args)
            },
        )
        jest.spyOn(version, 'getVersionInUse').mockResolvedValue(
            currentYarnVersion,
        )
        jest.spyOn(version, 'getYarnVersions').mockReturnValue(
            installedYarnVersions,
        )
        jest.spyOn(utils, 'getVersionsFromTags').mockResolvedValue(
            allYarnVersions,
        )
        jest.spyOn(log, 'default')
        jest.spyOn(log, 'error')
    })

    beforeEach(() => {
        writeAliases()
        getUserAliases.cache.clear()
        jest.clearAllMocks()
    })

    afterAll(jest.restoreAllMocks)

    describe('setAlias', () => {
        it('sets alias correctly', async () => {
            expect(await alias('def', '1.15')).toBe(0)
            expect(log.default.mock.calls).toMatchSnapshot()
            expect(await getUserAliases()).toMatchObject({
                ...mockAliases,
                def: '1.15',
            })
        })

        it('handles invalid version', async () => {
            expect(await alias('def', 'invalid')).toBe(1)
            expect(log.default.mock.calls).toMatchSnapshot()
            expect(await getUserAliases()).toMatchObject({
                ...mockAliases,
                def: 'invalid',
            })
        })

        it('handles thrown failure', async () => {
            const mockError = new Error('some error')
            utils.getVersionsFromTags.mockRejectedValueOnce(mockError)
            expect(await alias('def', '1.15')).toBe(2)
            expect(log.error).toHaveBeenCalledWith(mockError.message)
        })
    })

    describe('getAlias', () => {
        it('matches all aliases with empty pattern', async () => {
            expect(await alias()).toBe(0)
            expect(log.default.mock.calls).toMatchSnapshot()
        })

        it('matches only supplied pattern', async () => {
            expect(await alias('bc')).toBe(0)
            expect(log.default.mock.calls).toMatchSnapshot()
        })

        it('handles no matches for supplied pattern', async () => {
            expect(await alias('abracadabra')).toBe(1)
            expect(log.default.mock.calls).toMatchSnapshot()
        })

        it('handles thrown failure', async () => {
            const mockError = new Error('some error')
            utils.getVersionsFromTags.mockRejectedValueOnce(mockError)
            expect(await alias()).toBe(2)
            expect(log.error).toHaveBeenCalledWith(mockError.message)
        })
    })
})
