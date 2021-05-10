const os = require('os')
const childProcess = require('child_process')
const https = require('https')
const fs = require('fs')
const path = require('path')

const mockProps = require('jest-mock-props')

mockProps.extend(jest)
const log = jest.spyOn(console, 'log')
const mockHome = 'install-test-mock-home'
const actualExecSync = childProcess.execSync
const execSync = command => {
    return actualExecSync(command, {
        env: { HOME: `./${mockHome}`, PATH: process.env.PATH },
    })
}
jest.spyOn(childProcess, 'execSync').mockImplementation(execSync)
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
        const pass = fs.existsSync(received)
        const message = () => `expected file '${received}' to ${n(pass)}exist`
        return { pass, message }
    },
})

describe('install yvm', () => {
    const envHomeMock = jest.spyOnProp(process.env, 'HOME')
    const envUseLocal = jest.spyOnProp(process.env, 'USE_LOCAL')
    const envInstallVersion = jest.spyOnProp(process.env, 'INSTALL_VERSION')
    jest.spyOn(os, 'homedir').mockReturnValue(mockHome)

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
        execSync('make install-local')
    })

    afterEach(() => {
        jest.clearAllMocks()
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
            fs.rmdirSync(mockHome, { recursive: true })
            expect(mockHome).not.toBeExistingFile()
            envHomeMock.mockValue(mockHome)
            await run()
            expect(`${mockHome}/.yvm`).toBeExistingFile()
        })

        it('creates specified install directory if does not exist', async () => {
            const mockInstallDir = `${mockHome}/.myvm`
            fs.rmdirSync(mockHome, { recursive: true })
            const envYvmInstallDir = jest
                .spyOnProp(process.env, 'YVM_INSTALL_DIR')
                .mockValue(mockInstallDir)
            expect(mockInstallDir).not.toBeExistingFile()
            await run()
            envYvmInstallDir.mockRestore()
            expect(mockInstallDir).toBeExistingFile()
        })

        const rcFiles = [
            ['.bashrc', 'yvm.sh'],
            ['.zshrc', 'yvm.sh'],
            ['.config/fish/config.fish', 'yvm.fish'],
        ]
        const shConfigs = {
            [`${mockHome}/.bashrc`]: [
                `export YVM_DIR=${mockHome}/.yvm`,
                '[ -r $YVM_DIR/yvm.sh ] && . $YVM_DIR/yvm.sh',
            ],
            [`${mockHome}/.config/fish/config.fish`]: [
                `set -x YVM_DIR ${mockHome}/.yvm`,
                '[ -r $YVM_DIR/yvm.fish ]; and source $YVM_DIR/yvm.fish',
            ],
            [`${mockHome}/.zshrc`]: [
                `export YVM_DIR=${mockHome}/.yvm`,
                '[ -r $YVM_DIR/yvm.sh ] && . $YVM_DIR/yvm.sh',
            ],
        }
        it.each(rcFiles)('configures %s', async (rcFile, yvmScript) => {
            const filePath = `${mockHome}/${rcFile}`
            fs.mkdirSync(path.dirname(filePath), { recursive: true })
            fs.writeFileSync(filePath, 'dummy')
            await run()
            const content = fs.readFileSync(filePath, 'utf8')
            shConfigs[filePath].forEach(string => {
                expect(content).toContain(string)
            })
            const yvmShellScript = `${mockHome}/.yvm/${yvmScript}`
            expect(yvmShellScript).toBeExistingFile()
            // script is executable
            fs.accessSync(yvmShellScript, fs.constants.X_OK)
        })
    })

    describe('latest version', () => {
        beforeEach(() => {
            envHomeMock.mockValue(mockHome)
            fs.mkdirSync(mockHome, { recursive: true })
            fs.writeFileSync(`${mockHome}/.bashrc`, '')
            fs.mkdirSync(`${mockHome}/.config/fish`, { recursive: true })
            fs.writeFileSync(`${mockHome}/.config/fish/config.fish`, '')
        })

        afterAll(() => {
            fs.rmdirSync(mockHome, { recursive: true })
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
            const { version } = JSON.parse(
                fs.readFileSync(`${yvmHome}/.version`),
            )
            expect(version).toMatch(/v(\d+.)+\d+/)
        })
    })

    describe('specified version', () => {
        beforeEach(() => {
            envHomeMock.mockValue(mockHome)
            fs.mkdirSync(mockHome, { recursive: true })
            fs.writeFileSync(`${mockHome}/.bashrc`, '')
            fs.mkdirSync(`${mockHome}/.config/fish`, { recursive: true })
            fs.writeFileSync(`${mockHome}/.config/fish/config.fish`, '')
        })

        afterEach(() => {
            fs.rmdirSync(mockHome, { recursive: true })
        })

        it.each([
            ['v2.3.0', 'v2.3.0'],
            ['2.4', 'v2.4.3'],
        ])(
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
                const { version } = JSON.parse(
                    fs.readFileSync(`${yvmHome}/.version`),
                )
                expect(version).toMatch(versionToMatch)
            },
        )
    })

    describe('invalid version', () => {
        const installVersion = 'invalid-version-xyz'
        beforeEach(() => {
            envHomeMock.mockValue(mockHome)
            envInstallVersion.mockValue(installVersion)
        })

        afterAll(() => {
            fs.rmdirSync(mockHome, { recursive: true })
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
