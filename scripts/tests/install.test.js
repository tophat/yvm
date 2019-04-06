const os = require('os')
const fs = require('fs-extra')
const { execSync } = require('child_process')

const { getConfig, preflightCheck, run } = require('../install')

const mockProp = (obj, prop, mockValue) => {
    const original = obj[prop]
    const setValue = value => {
        if (value === undefined) {
            delete obj[prop]
        } else {
            obj[prop] = value
        }
    }
    setValue(mockValue)
    return {
        mockValue: setValue,
        reset: () => setValue(mockValue),
        restore: () => setValue(original),
    }
}

describe('yvm install', () => {
    const log = jest.spyOn(console, 'log')
    const mockHomeValue = 'mock-home'
    const envHomeMock = mockProp(process.env, 'HOME')
    const envUseLocal = mockProp(process.env, 'USE_LOCAL')
    const envInstallVersion = mockProp(process.env, 'INSTALL_VERSION')
    jest.spyOn(os, 'homedir').mockReturnValue(mockHomeValue)

    const expectedConfigObject = ({ homePath, tagName = null, useLocal }) => ({
        paths: {
            home: homePath,
            yvm: `${homePath}/.yvm`,
            yvmSh: `${homePath}/.yvm/yvm.sh`,
            zip: `${useLocal ? 'artifacts' : `${homePath}/.yvm`}/yvm.zip`,
        },
        useLocal,
        version: { tagName },
    })

    beforeAll(() => {
        execSync(`make install-local`)
    })

    afterEach(() => {
        jest.clearAllMocks()
        fs.removeSync(mockHomeValue)
    })

    afterAll(() => {
        jest.restoreAllMocks()
        envHomeMock.restore()
        envUseLocal.restore()
        envInstallVersion.restore()
    })

    it('runs when executed', () => {
        const output = String(execSync('node ./scripts/install.js')).trim()
        const expectedOutput = [
            'All dependencies satisfied',
            'yvm successfully installed',
            `Open another terminal window`,
        ]
        expectedOutput.forEach(expected =>
            expect(output).toEqual(expect.stringContaining(expected)),
        )
    })

    describe('preflightCheck', () => {
        it('continues when no missing deps', () => {
            preflightCheck('node')
        })

        it('throws error when missing deps', () => {
            expect(() => preflightCheck('somemissingbin')).toThrow(
                /The install cannot proceed due missing dependencies/,
            )
        })
    })

    describe('local version', () => {
        const mockHome = mockHomeValue
        beforeEach(() => {
            envHomeMock.mockValue(mockHome)
            envUseLocal.mockValue(true)
            envInstallVersion.reset()
        })

        it('indicates successful completion', async () => {
            const config = getConfig()
            expect(config).toMatchObject(
                expectedConfigObject({
                    homePath: mockHome,
                    useLocal: 'true',
                }),
            )
            await run()
            const yvmHome = config.paths.yvm
            const expectedOutput = [
                'All dependencies satisfied',
                'yvm successfully installed',
                `source ${yvmHome}`,
            ]
            expectedOutput.forEach(output =>
                expect(log).toHaveBeenCalledWith(
                    expect.stringContaining(output),
                ),
            )
            const installFiles = ['yvm.sh', 'yvm.js', 'yvm.fish']
            installFiles.forEach(file => {
                const filePath = `${yvmHome}/${file}`
                expect(fs.pathExistsSync(filePath)).toBe(true)
            })

            // should not delete zip file
            expect(fs.pathExistsSync(config.paths.zip)).toBe(true)
            // does not create version tag
            expect(fs.pathExistsSync(`${yvmHome}/.version`)).toBe(false)
            // script is executable
            fs.accessSync(`${yvmHome}/yvm.sh`, fs.constants.X_OK)
        })

        it('creates home install directory if does not exist', async () => {
            const testHomePath = 'mock-create-home'
            expect(fs.pathExistsSync(testHomePath)).toBe(false)
            envHomeMock.mockValue(testHomePath)
            await run()
            envHomeMock.reset()
            expect(fs.pathExistsSync(`${testHomePath}/.yvm`)).toBe(true)
            fs.removeSync(testHomePath)
        })

        it('creates specified install directory if does not exist', async () => {
            const mockInstallDir = 'mock-install-dir/.yvm'
            const envYvmInstallDir = mockProp(
                process.env,
                'YVM_INSTALL_DIR',
                mockInstallDir,
            )
            expect(fs.pathExistsSync(mockInstallDir)).toBe(false)
            await run()
            envYvmInstallDir.restore()
            expect(fs.pathExistsSync(mockInstallDir)).toBe(true)
            fs.removeSync('mock-install-dir')
        })

        const rcFiles = ['.bashrc', '.zshrc', '.config/fish/config.fish']
        const shConfigs = {
            [`${mockHomeValue}/.bashrc`]: [
                `export YVM_DIR=${mockHomeValue}/.yvm`,
                '[ -r $YVM_DIR/yvm.sh ] && . $YVM_DIR/yvm.sh',
            ],
            [`${mockHomeValue}/.config/fish/config.fish`]: [
                `set -x YVM_DIR ${mockHomeValue}/.yvm`,
                '. $YVM_DIR/yvm.fish',
            ],
            [`${mockHomeValue}/.zshrc`]: [
                `export YVM_DIR=${mockHomeValue}/.yvm`,
                '[ -r $YVM_DIR/yvm.sh ] && . $YVM_DIR/yvm.sh',
            ],
        }
        it.each(rcFiles.map(file => [file]))('configures %s', async rcFile => {
            const filePath = `${mockHomeValue}/${rcFile}`
            fs.outputFileSync(filePath, 'dummy')
            await run()
            const content = fs.readFileSync(filePath).toString()
            shConfigs[filePath].forEach(string => {
                expect(content.includes(string)).toBe(true)
            })
        })
    })

    describe('latest version', () => {
        const mockHome = 'other-mock-home'
        beforeEach(() => {
            envHomeMock.mockValue(mockHome)
            envUseLocal.reset()
            envInstallVersion.reset()
        })

        afterAll(() => {
            fs.removeSync(mockHome)
        })

        it('indicates successful completion', async () => {
            const config = getConfig()
            expect(config).toMatchObject(
                expectedConfigObject({
                    homePath: mockHome,
                    useLocal: false,
                }),
            )
            await run()
            const yvmHome = config.paths.yvm
            const expectedOutput = [
                'All dependencies satisfied',
                'Querying github release API to determine latest version',
                'yvm successfully installed',
                `source ${yvmHome}`,
            ]
            expectedOutput.forEach(output =>
                expect(log).toHaveBeenCalledWith(
                    expect.stringContaining(output),
                ),
            )
            const installFiles = ['yvm.sh', 'yvm.js', 'yvm.fish']
            installFiles.forEach(file => {
                const filePath = `${yvmHome}/${file}`
                expect(fs.pathExistsSync(filePath)).toBe(true)
            })

            // should delete zip file
            expect(fs.pathExistsSync(config.paths.zip)).toBe(false)
            // creates version tag
            const { version } = fs.readJsonSync(`${yvmHome}/.version`)
            expect(version).toMatch(/v(\d+.)+\d+/)
            // script is executable
            fs.accessSync(`${yvmHome}/yvm.sh`, fs.constants.X_OK)
        })
    })

    describe('specified version', () => {
        const mockHome = 'another-mock-home'
        beforeEach(() => {
            envHomeMock.mockValue(mockHome)
            envUseLocal.reset()
        })

        afterEach(() => {
            fs.removeSync(mockHome)
        })

        const testFn = async installVersion => {
            envInstallVersion.mockValue(installVersion)
            const config = getConfig()
            expect(config).toMatchObject(
                expectedConfigObject({
                    homePath: mockHome,
                    useLocal: false,
                    tagName: installVersion,
                }),
            )
            await run()
            const yvmHome = config.paths.yvm
            const expectedOutput = [
                'All dependencies satisfied',
                'Installing Version',
                'yvm successfully installed',
                `source ${yvmHome}`,
            ]
            expectedOutput.forEach(output =>
                expect(log).toHaveBeenCalledWith(
                    expect.stringContaining(output),
                ),
            )
            const installFiles = ['yvm.sh', 'yvm.js', 'yvm.fish']
            installFiles.forEach(file => {
                const filePath = `${yvmHome}/${file}`
                expect(fs.pathExistsSync(filePath)).toBe(true)
            })

            // should delete zip file
            expect(fs.pathExistsSync(config.paths.zip)).toBe(false)
            // creates version tag
            const { version } = fs.readJsonSync(`${yvmHome}/.version`)
            expect(version).toMatch(installVersion)
            // script is executable
            fs.accessSync(`${yvmHome}/yvm.sh`, fs.constants.X_OK)
        }

        it.each(['v2.3.0', '2.4'].map(a => [a]))(
            'indicates successful completion %s',
            testFn,
        )
    })

    describe('invalid version', () => {
        const installVersion = 'invalid-version-xyz'
        const mockHome = 'invalid-mock-home'
        beforeEach(() => {
            envHomeMock.mockValue(mockHome)
            envUseLocal.reset()
            envInstallVersion.mockValue(installVersion)
        })

        afterAll(() => {
            fs.removeSync(mockHome)
        })

        it('indicates invalid version tag', async done => {
            const config = getConfig()
            try {
                await run()
                done.fail(`Run did not throw an error`)
            } catch (e) {
                expect(e.message).toMatch(/No release version/)
            }
            const yvmHome = config.paths.yvm
            // should not have downloaded zip file
            expect(fs.pathExistsSync(config.paths.zip)).toBe(false)
            // should not have created version tag
            expect(fs.pathExistsSync(`${yvmHome}/.version`)).toBe(false)
            // should not have extracted files
            const installFiles = ['yvm.sh', 'yvm.js', 'yvm.fish']
            installFiles.forEach(file => {
                const filePath = `${yvmHome}/${file}`
                expect(fs.pathExistsSync(filePath)).toBe(false)
            })
            done()
        })
    })
})
