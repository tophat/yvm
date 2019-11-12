const os = require('os')
const { execSync } = require('child_process')
const https = require('https')

const fs = require('fs-extra')
const mockProps = require('jest-mock-props')

mockProps.extend(jest)

jest.unmock('fs')
const {
    downloadFile,
    getConfig,
    getTagAndUrlFromRelease,
    run,
} = require('../../scripts/install')

const mockReleases = [
    {
        tag_name: 'v3.4.0',
        name: 'v3.4.0',
        assets: [
            {
                name: 'yvm.zip',
                browser_download_url:
                    'https://github.com/tophat/yvm/releases/download/v3.4.0/yvm.zip',
            },
            {
                name: 'yvm.js',
                browser_download_url:
                    'https://github.com/tophat/yvm/releases/download/v3.4.0/yvm.js',
            },
        ],
    },
    {
        tag_name: 'v3.3.0',
        name: 'v3.3.0',
        assets: [
            {
                name: 'yvm.zip',
                browser_download_url:
                    'https://github.com/tophat/yvm/releases/download/v3.3.0/yvm.zip',
            },
        ],
    },
    {
        tag_name: 'bad-release',
        name: 'bad-release',
        assets: [],
    },
]

jest.setTimeout(10000)
const n = p => (p ? 'not ' : '')
expect.extend({
    toBeExistingFile: received => {
        const pass = fs.pathExistsSync(received)
        const message = () => `expected file '${received}' to ${n(pass)}exist`
        return { pass, message }
    },
})

describe('install yvm', () => {
    const log = jest.spyOn(console, 'log')
    const mockHomeValue = 'mock-home'
    const envHomeMock = jest.spyOnProp(process.env, 'HOME')
    const envUseLocal = jest.spyOnProp(process.env, 'USE_LOCAL')
    const envInstallVersion = jest.spyOnProp(process.env, 'INSTALL_VERSION')
    jest.spyOn(os, 'homedir').mockReturnValue(mockHomeValue)
    const expectedConfigObject = ({
        homePath,
        paths = {},
        tagName = null,
        useLocal,
    }) => ({
        paths: {
            ...paths,
            home: homePath,
            yvm: `${homePath}/.yvm`,
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
            return expect(
                downloadFile({ source: 'http://example.com' }),
            ).rejects.toThrow('Only https scheme is supported')
        })

        it('throws error on status error codes', async () => {
            expect.assertions(1)
            https.get.mockImplementation((_, cb) => cb({ statusCode: 400 }))
            await expect(
                downloadFile({ source: 'https://400.example.com' }),
            ).rejects.toThrow('Failed to download file')
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

    describe('getTagAndUrlFromRelease', () => {
        it.each(mockReleases.map(Array))(
            'gets correct release asset',
            releaseData => {
                expect(getTagAndUrlFromRelease(releaseData)).toMatchSnapshot()
            },
        )
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
                'yvm successfully installed',
                `source ${yvmHome}`,
            ]
            expectedOutput.forEach(output =>
                expect(log).toHaveBeenCalledWith(
                    expect.stringContaining(output),
                ),
            )
            // does not create version tag
            expect(`${yvmHome}/.version`).not.toBeExistingFile()
        })

        it('creates home install directory if does not exist', async () => {
            const testHomePath = 'mock-create-home'
            fs.removeSync(testHomePath)
            expect(testHomePath).not.toBeExistingFile()
            envHomeMock.mockValue(testHomePath)
            await run()
            expect(`${testHomePath}/.yvm`).toBeExistingFile()
            fs.removeSync(testHomePath)
        })

        it('creates specified install directory if does not exist', async () => {
            const mockInstallDir = 'mock-install-dir/.myvm'
            fs.removeSync('mock-install-dir')
            const envYvmInstallDir = jest
                .spyOnProp(process.env, 'YVM_INSTALL_DIR')
                .mockValue(mockInstallDir)
            expect(mockInstallDir).not.toBeExistingFile()
            await run()
            envYvmInstallDir.mockRestore()
            expect(mockInstallDir).toBeExistingFile()
            fs.removeSync('mock-install-dir')
        })

        const rcFiles = [
            ['.bashrc', 'yvm.sh'],
            ['.zshrc', 'yvm.sh'],
            ['.config/fish/config.fish', 'yvm.fish'],
        ]
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
        it.each(rcFiles)('configures %s', async (rcFile, yvmScript) => {
            const filePath = `${mockHomeValue}/${rcFile}`
            fs.outputFileSync(filePath, 'dummy')
            await run()
            const content = fs.readFileSync(filePath, 'utf8')
            shConfigs[filePath].forEach(string => {
                expect(content).toContain(string)
            })
            const yvmShellScript = `${mockHomeValue}/.yvm/${yvmScript}`
            expect(yvmShellScript).toBeExistingFile()
            // script is executable
            fs.accessSync(yvmShellScript, fs.constants.X_OK)
        })
    })

    describe('latest version', () => {
        const mockHome = 'other-mock-home'
        beforeEach(() => {
            envHomeMock.mockValue(mockHome)
            fs.ensureFile(`${mockHome}/.bashrc`)
            fs.ensureFile(`${mockHome}/.config/fish/config.fish`)
        })

        afterAll(() => {
            fs.removeSync(mockHome)
        })

        it.each([
            ['indicates successful completion'],
            ['reinstalls removing existing files'],
        ])('%s', async () => {
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
                'Querying github release API to determine latest version',
                'yvm successfully installed',
                `source ${yvmHome}`,
            ]
            expectedOutput.forEach(output =>
                expect(log).toHaveBeenCalledWith(
                    expect.stringContaining(output),
                ),
            )
            const installFiles = [
                ['yvm.sh', true],
                ['yvm.js', false],
                ['yvm.fish', true],
                ['shim/yarn', true],
            ]
            installFiles.forEach(([file, isExecutable]) => {
                const filePath = `${yvmHome}/${file}`
                expect(filePath).toBeExistingFile()
                // script is executable
                if (isExecutable) fs.accessSync(filePath, fs.constants.X_OK)
            })

            // creates version tag
            const { version } = fs.readJsonSync(`${yvmHome}/.version`)
            expect(version).toMatch(/v(\d+.)+\d+/)
        })
    })

    describe('specified version', () => {
        const mockHome = 'another-mock-home'
        beforeEach(() => {
            envHomeMock.mockValue(mockHome)
            fs.ensureFile(`${mockHome}/.bashrc`)
            fs.ensureFile(`${mockHome}/.config/fish/config.fish`)
        })

        afterEach(() => {
            fs.removeSync(mockHome)
        })

        it.each([['v2.3.0', 'v2.3.0'], ['2.4', 'v2.4.3']])(
            'indicates successful completion %s',
            async (installVersion, versionToMatch) => {
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
                    'Installing Version',
                    'yvm successfully installed',
                    `source ${yvmHome}`,
                ]
                expectedOutput.forEach(output =>
                    expect(log).toHaveBeenCalledWith(
                        expect.stringContaining(output),
                    ),
                )
                const installFiles = [
                    ['yvm.sh', true],
                    ['yvm.js', false],
                    ['yvm.fish', false],
                ]
                installFiles.forEach(([file, isExecutable]) => {
                    const filePath = `${yvmHome}/${file}`
                    expect(filePath).toBeExistingFile()
                    // script is executable
                    if (isExecutable) fs.accessSync(filePath, fs.constants.X_OK)
                })

                // creates version tag
                const { version } = fs.readJsonSync(`${yvmHome}/.version`)
                expect(version).toMatch(versionToMatch)
            },
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

        it('indicates invalid version tag', async () => {
            const config = getConfig()
            await expect(run()).rejects.toThrow('No release version')
            const yvmHome = config.paths.yvm
            // should not have created version tag
            expect(`${yvmHome}/.version`).not.toBeExistingFile()
            // should not have extracted files
            const installFiles = ['yvm.sh', 'yvm.js', 'yvm.fish', 'shim/yarn']
            installFiles.forEach(file => {
                const filePath = `${yvmHome}/${file}`
                expect(filePath).not.toBeExistingFile()
            })
        })
    })
})
