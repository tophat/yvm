import fs from 'fs-extra'
import path from 'path'

import { alias } from '../../src/commands/alias'
import { STORAGE_FILE, getUserAliases } from '../../src/util/alias'
import log from '../../src/util/log'
import { yvmPath as rootPath } from '../../src/util/path'
import * as utils from '../../src/util/utils'
import * as version from '../../src/util/version'

jest.mock('../../src/util/path', () => ({
    yvmPath: '/tmp/yvmInstall',
    getPathEntries: () => [],
}))

describe('alias', () => {
    const currentYarnVersion = '1.15.2'
    const installedYarnVersions = [currentYarnVersion, '1.13.0', '1.7.0']
    const allYarnVersions = [...installedYarnVersions, '1.6.0', '1.3.0']
    const mockAliases = {
        abc: 'b',
        bcd: 'z',
        xyz: '1.13',
    }

    const writeAliases = () => {
        const aliasFilePath = path.join(rootPath, STORAGE_FILE)
        fs.writeFileSync(aliasFilePath, JSON.stringify(mockAliases))
    }

    beforeAll(() => {
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
    })

    beforeEach(() => {
        writeAliases()
        getUserAliases.cache.clear()
        jest.clearAllMocks()
    })

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
    })
})
