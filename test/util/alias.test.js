import childProcess from 'child_process'

import * as mockProps from 'jest-mock-props'
import { fs, vol } from 'memfs'

mockProps.extend(jest)

import log from 'util/log'
import * as utils from 'util/utils'
import * as alias from 'util/alias'

jest.spyOn(childProcess, 'execSync')
const pathSpy = jest.spyOnProp(process.env, 'PATH')
const fishUserPathSpy = jest.spyOnProp(process.env, 'fish_user_paths')

jest.spyOn(utils, 'getRequest')
jest.spyOn(utils, 'getVersionsFromTags')

describe('alias util', () => {
    const yvmPath = '/Users/tophat/.yvm'
    jest.spyOn(log, 'info')

    afterAll(jest.restoreAllMocks)

    describe('resolveLatest', () => {
        it('gets latest version', async () => {
            utils.getVersionsFromTags.mockReturnValueOnce([
                '1.4.0',
                '1.3.0',
                '1.2.0',
            ])
            expect(await alias.resolveLatest()).toBe('1.4.0')
        })
    })

    describe('resolveStable', () => {
        afterEach(() => {
            alias.resolveStable.cache.clear()
        })

        it('gets stable version', async () => {
            utils.getRequest.mockReturnValueOnce(' 1.15.2 ')
            expect(await alias.resolveStable()).toBe('1.15.2')
            expect(utils.getRequest).toHaveBeenCalledWith(
                'https://yarnpkg.com/latest-version',
            )
        })

        it('does not get stable version', async () => {
            utils.getRequest.mockReturnValueOnce('  ')
            expect(await alias.resolveStable()).toBe(alias.UNRESOLVED)
        })
    })

    describe('resolveSystem', () => {
        beforeEach(() => {
            vol.fromJSON({
                '/usr/local/bin/yarn': 'mock exec',
            })
        })

        afterEach(() => {
            alias.resolveSystem.cache.clear()
            pathSpy.mockReset()
            fishUserPathSpy.mockReset()
        })

        afterAll(() => {
            vol.reset()
        })

        it('returns nothing if yarn executable fails to run', async () => {
            const mockError = new Error('not executable')
            childProcess.execSync.mockImplementationOnce(() => {
                throw mockError
            })
            expect(await alias.resolveSystem()).toEqual(alias.NOT_AVAILABLE)
            expect(log.info).toHaveBeenCalledWith(mockError.message)
        })

        it('gets first non yvm yarn executable', async () => {
            pathSpy.mockValue(`${yvmPath}/versions/v1.13.0/bin:/usr/local/bin:`)
            childProcess.execSync.mockReturnValueOnce('1.14.0')
            expect(await alias.resolveSystem()).toEqual('1.14.0')
            expect(childProcess.execSync).toHaveBeenCalledWith(
                expect.stringContaining('usr/local/bin/yarn'),
            )
        })

        it('returns nothing if yarn not found in path', async () => {
            pathSpy.mockValue('/Users/tophat/.nvm/versions/node/v6.11.5/bin:')
            expect(await alias.resolveSystem()).toEqual(alias.NOT_AVAILABLE)
        })

        it('gets first non yvm yarn executable in fish shell', async () => {
            fishUserPathSpy.mockValue(
                `${yvmPath}/versions/v1.13.0/bin /usr/local/bin`,
            )
            childProcess.execSync.mockReturnValueOnce('1.14.0')
            expect(await alias.resolveSystem({ shell: 'fish' })).toEqual(
                '1.14.0',
            )
            expect(childProcess.execSync).toHaveBeenCalledWith(
                expect.stringContaining('usr/local/bin/yarn'),
            )
        })

        it('returns nothing if yarn not found in fish user path', async () => {
            fishUserPathSpy.mockValue(
                '/Users/tophat/.nvm/versions/node/v6.11.5/bin ',
            )
            expect(await alias.resolveSystem({ shell: 'fish' })).toEqual(
                alias.NOT_AVAILABLE,
            )
        })
    })

    describe('getDefaultAliases', () => {
        it('matches snapshot', () => {
            expect(alias.getDefaultAliases()).toMatchObject({
                [alias.LATEST]: alias.UNRESOLVED,
                [alias.STABLE]: alias.UNRESOLVED,
                [alias.SYSTEM]: alias.UNRESOLVED,
            })
        })
    })

    describe('getUserAliases', () => {
        const aliasesPath = `${yvmPath}/${alias.STORAGE_FILE}`
        beforeEach(() => {
            vol.fromJSON({
                [aliasesPath]: '',
            })
            alias.getUserAliases.cache.clear()
        })

        afterAll(() => {
            vol.reset()
        })

        it('sets default to stable', async () => {
            expect(await alias.getUserAliases(yvmPath)).toEqual({
                [alias.DEFAULT]: alias.STABLE,
            })
        })

        it('overwrites default with loaded value', async () => {
            const mockDefaultAlias = 'someothervalue'
            vol.fromJSON({
                [aliasesPath]: `{"default":"${mockDefaultAlias}"}`,
            })
            expect(await alias.getUserAliases(yvmPath)).toEqual({
                [alias.DEFAULT]: mockDefaultAlias,
            })
        })

        it('uses default when aliases file is corrupted', async () => {
            vol.fromJSON({
                [aliasesPath]: '"default":"testing"',
            })
            expect(await alias.getUserAliases(yvmPath)).toEqual({
                [alias.DEFAULT]: alias.STABLE,
            })
        })

        describe('getMatchingAliases', () => {
            it('returns all aliases with empty pattern', async () => {
                const mockAliases = {
                    default: '1.15.0',
                    other: '1.2.0',
                }
                const expectedAliases = [
                    { name: 'default', value: '1.15.0' },
                    { name: 'other', value: '1.2.0' },
                ]
                vol.fromJSON({
                    [aliasesPath]: JSON.stringify(mockAliases),
                })
                expect(
                    await alias.getMatchingAliases(undefined, yvmPath),
                ).toEqual(expectedAliases)
            })

            it('returns only matching aliases', async () => {
                const mockAliases = {
                    default: '1.15.0',
                    other: '1.2.0',
                }
                const expectedAliases = [{ name: 'other', value: '1.2.0' }]
                vol.fromJSON({
                    [aliasesPath]: JSON.stringify(mockAliases),
                })
                expect(await alias.getMatchingAliases('oth', yvmPath)).toEqual(
                    expectedAliases,
                )
            })
        })
    })

    describe('setAlias', () => {
        const aliasesPath = `${yvmPath}/${alias.STORAGE_FILE}`
        jest.spyOn(log, 'default')
        beforeEach(() => {
            vol.fromJSON({
                [aliasesPath]: '',
            })
            alias.getUserAliases.cache.clear()
        })

        afterAll(() => {
            vol.reset()
        })

        it('sets user alias', async () => {
            expect(
                await alias.setAlias({
                    name: 'test',
                    version: '1.7.0',
                    yvmPath,
                }),
            ).toBe(true)
            expect(await alias.getUserAliases(yvmPath)).toEqual({
                [alias.DEFAULT]: alias.STABLE,
                test: '1.7.0',
            })
        })

        it.each(alias.RESERVED_NAMES.map(name => [name]))(
            'does not override reserved alias %s',
            async () => {
                expect(
                    await alias.setAlias({
                        name: alias.STABLE,
                        version: '1.7.0',
                        yvmPath,
                    }),
                ).toBe(false)
                expect(log.default).toHaveBeenCalledWith(
                    expect.stringContaining('Unable to set alias'),
                )
            },
        )
    })

    describe('unsetAlias', () => {
        const aliasesPath = `${yvmPath}/${alias.STORAGE_FILE}`
        jest.spyOn(fs, 'writeFileSync')
        jest.spyOn(log, 'default')

        beforeEach(() => {
            vol.fromJSON({
                [aliasesPath]: '',
            })
        })

        afterEach(() => {
            jest.clearAllMocks()
            alias.getUserAliases.cache.clear()
        })

        afterAll(() => {
            vol.reset()
        })

        it('does not unset reserved alias', async () => {
            expect(
                await alias.unsetAlias({
                    name: alias.STABLE,
                    yvmPath,
                }),
            ).toBe(false)
            expect(log.default).toHaveBeenCalledWith(
                expect.stringContaining('Unable to unset'),
            )
        })

        it('does not unset aliases with dependants', async () => {
            vol.fromJSON({
                [aliasesPath]: JSON.stringify({
                    one: 'zero',
                    two: 'one',
                    zero: '1.7.0',
                }),
            })
            await alias.getUserAliases(yvmPath)
            expect(
                await alias.unsetAlias({
                    name: 'zero',
                    yvmPath,
                }),
            ).toBe(false)
            expect(fs.writeFileSync).not.toHaveBeenCalled()
            expect(log.default).toHaveBeenCalledWith(
                expect.stringContaining(
                    'The following aliases will be orphaned',
                ),
            )
        })

        it('unset aliases with dependants with the force option', async () => {
            vol.fromJSON({
                [aliasesPath]: JSON.stringify({
                    one: 'zero',
                    two: 'one',
                    zero: '1.7.0',
                }),
            })
            const mockAliases = await alias.getUserAliases(yvmPath)
            expect(
                await alias.unsetAlias({
                    name: 'zero',
                    force: true,
                    yvmPath,
                }),
            ).toBe(true)
            delete mockAliases.zero
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                aliasesPath,
                JSON.stringify(mockAliases),
            )
        })

        it('unset all dependant aliases with the recursive option', async () => {
            vol.fromJSON({
                [aliasesPath]: JSON.stringify({
                    one: 'zero',
                    two: 'one',
                    zero: '1.7.0',
                }),
            })
            await alias.getUserAliases(yvmPath)
            expect(
                await alias.unsetAlias({
                    name: 'zero',
                    recursive: true,
                    yvmPath,
                }),
            ).toBe(true)
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                aliasesPath,
                JSON.stringify({ [alias.DEFAULT]: alias.STABLE }),
            )
        })

        it('does not crash on cyclic alias dependancy', async () => {
            vol.fromJSON({
                [aliasesPath]: JSON.stringify({
                    one: 'zero',
                    two: 'one',
                    zero: 'two',
                }),
            })
            expect(
                await alias.unsetAlias({
                    name: 'zero',
                    recursive: true,
                    yvmPath,
                }),
            ).toBe(true)
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                aliasesPath,
                JSON.stringify({ [alias.DEFAULT]: alias.STABLE }),
            )
        })

        it('unsets alias successfully', async () => {
            vol.fromJSON({
                [aliasesPath]: JSON.stringify({
                    one: 'zero',
                    two: 'one',
                    zero: '1.7.0',
                }),
            })
            const mockAliases = await alias.getUserAliases(yvmPath)
            expect(
                await alias.unsetAlias({
                    name: 'two',
                    force: true,
                    yvmPath,
                }),
            ).toBe(true)
            delete mockAliases.two
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                aliasesPath,
                JSON.stringify(mockAliases),
            )
        })
    })

    describe('resolveAliases', () => {
        const aliasesPath = `${yvmPath}/${alias.STORAGE_FILE}`
        jest.spyOn(fs, 'writeFileSync')
        jest.spyOn(log, 'default')

        beforeEach(() => {
            vol.fromJSON({
                [aliasesPath]: '',
            })
        })

        afterEach(() => {
            vol.reset()
            jest.clearAllMocks()
            alias.getUserAliases.cache.clear()
            alias.resolveAliases.cache.clear()
            alias.resolveMatchingAliases.cache.clear()
        })

        it('matches all aliases on empty pattern', async () => {
            const version = '1.8.0'
            vol.fromJSON({
                [aliasesPath]: JSON.stringify({
                    one: 'zero',
                    two: 'one',
                    zero: version,
                }),
            })
            const result = await alias.resolveMatchingAliases(
                undefined,
                yvmPath,
            )
            expect(result).toMatchSnapshot()
        })

        it('does not crash on cyclic alias dependancy', async () => {
            vol.fromJSON({
                [aliasesPath]: JSON.stringify({
                    one: 'zero',
                    two: 'one',
                    zero: 'two',
                }),
            })
            const result = await alias.resolveMatchingAliases(
                undefined,
                yvmPath,
            )
            expect(result).toMatchSnapshot()
        })

        it('resolves only matching aliases', async () => {
            const version = '1.8.0'
            vol.fromJSON({
                [aliasesPath]: JSON.stringify({
                    one: 'zero',
                    two: 'one',
                    zero: version,
                }),
            })
            expect(await alias.resolveMatchingAliases('one', yvmPath)).toEqual([
                { name: 'one', value: { value: 'zero', version } },
            ])
        })

        it('returns not available when unable to resolve reserved', async () => {
            expect(await alias.resolveReserved('somealias')).toEqual(
                alias.NOT_AVAILABLE,
            )
        })
    })

    describe('getFormatter', () => {
        const currentVersion = '1.13.0'
        const installedVersions = [currentVersion, '1.8.0', '1.3.0']
        const allVersions = ['1.2.0', '1.5.0', ...installedVersions]
        const formatter = alias.getFormatter(
            allVersions,
            installedVersions,
            currentVersion,
        )
        const inputCases = [
            ['current', '^1.1', '1.13.0'],
            ['installed', '1.3', '1.3.0'],
            ['available', '1.5', '1.5.0'],
            ['unavailable', '1.1', '1.1.0'],
            ['undefined', '1.2.0', undefined],
            [alias.STABLE, undefined, '1.13.0'],
            [alias.SYSTEM, undefined, '1.7.0'],
        ]
        it.each(inputCases)(
            'formats and colors inputs correctly %s alias',
            (name, version, target) => {
                const formatted = formatter(name, version, target)
                log(formatted)
                expect(formatted).toMatchSnapshot()
            },
        )
    })
})
