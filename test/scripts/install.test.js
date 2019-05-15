const os = require('os')
const fs = require('fs-extra')
const { execSync } = require('child_process')
const https = require('https')
const mockProps = require('jest-mock-props')
mockProps.extend(jest)

const {
    downloadFile,
    getConfig,
    preflightCheck,
    run,
} = require('../../scripts/install')

describe('install yvm', () => {
    const log = jest.spyOn(console, 'log')
    const mockHomeValue = 'mock-home'
    const envHomeMock = jest.spyOnProp(process.env, 'HOME')
    const envUseLocal = jest.spyOnProp(process.env, 'USE_LOCAL')
    const envInstallVersion = jest.spyOnProp(process.env, 'INSTALL_VERSION')
    jest.spyOn(os, 'homedir').mockReturnValue(mockHomeValue)
    const installFiles = ['yvm.sh', 'yvm.js', 'yvm.fish', 'shim/yarn']
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
        envHomeMock.mockReset()
        envUseLocal.mockReset()
        envInstallVersion.mockReset()
    })

    afterAll(jest.restoreAllMocks)

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

    describe('downloadFile', () => {
        const mockResponseProps = {
            on(_, cb) {
                cb()
            },
            setEncoding() {},
            headers: {},
        }

        beforeAll(() => jest.spyOn(https, 'get'))
        beforeEach(() => https.get.mockReset())
        afterAll(() => https.get.mockRestore())

        it('throws error on non-secure URL', async () => {
            expect.assertions(1)
            try {
                await downloadFile({ source: 'http://example.com' })
            } catch (err) {
                expect(err.toString()).toMatch(/Only https scheme is supported/)
            }
        })

        it('throws error on status error codes', async () => {
            expect.assertions(1)
            https.get.mockImplementation((_, cb) => cb({ statusCode: 400 }))
            try {
                await downloadFile({ source: 'https://400.example.com' })
            } catch (err) {
                expect(err.toString()).toMatch(/Failed to download file/)
            }
        })

        it('follows redirect paths', async () => {
            expect.assertions(1)
            const mockRedirectUrl = 'https://redirectme.example.com'
            https.get.mockImplementation(({ hostname }, cb) =>
                mockRedirectUrl.includes(hostname)
                    ? cb({ ...mockResponseProps, statusCode: 200 })
                    : cb({
                          ...mockResponseProps,
                          statusCode: 302,
                          headers: { location: mockRedirectUrl },
                      }),
            )
            await downloadFile({ source: 'https://400.example.com' })
            expect(https.get).toHaveBeenCalledTimes(2)
        })
    })

    describe('local version', () => {
        const mockHome = mockHomeValue
        beforeEach(() => {
            envHomeMock.mockValue(mockHome)
            envUseLocal.mockValue('true')
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
            expect(fs.pathExistsSync(`${testHomePath}/.yvm`)).toBe(true)
            fs.removeSync(testHomePath)
        })

        it('creates specified install directory if does not exist', async () => {
            const mockInstallDir = 'mock-install-dir/.myvm'
            const envYvmInstallDir = jest
                .spyOnProp(process.env, 'YVM_INSTALL_DIR')
                .mockValue(mockInstallDir)
            expect(fs.pathExistsSync(mockInstallDir)).toBe(false)
            await run()
            envYvmInstallDir.mockRestore()
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
            const content = fs.readFileSync(filePath, 'utf8')
            shConfigs[filePath].forEach(string => {
                expect(content.includes(string)).toBe(true)
            })
        })
    })

    describe('latest version', () => {
        const mockHome = 'other-mock-home'
        beforeEach(() => {
            envHomeMock.mockValue(mockHome)
        })

        afterAll(() => {
            fs.removeSync(mockHome)
        })

        const installFn = async () => {
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
            const installFiles = ['yvm.sh', 'yvm.js', 'yvm.fish', 'shim/yarn']
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
        }

        it('indicates successful completion', installFn)
        it('reinstalls removing existing files', installFn)
    })

    describe('specified version', () => {
        const mockHome = 'another-mock-home'
        beforeEach(() => {
            envHomeMock.mockValue(mockHome)
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
            installFiles.forEach(file => {
                const filePath = `${yvmHome}/${file}`
                expect(fs.pathExistsSync(filePath)).toBe(false)
            })
            done()
        })
    })
})
