const os = require('os')
const fs = require('fs-extra')
const { execSync } = require('child_process')

const {
    ensureConfig,
    escapeRegExp,
    getConfig,
    preflightCheck,
    run,
} = require('../install')

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

    const confirmShellConfig = configFile => {
        const content = fs.readFileSync(configFile).toString()
        const { shConfigs } = getConfig()
        shConfigs[configFile].forEach(string => {
            const exactMatch = new RegExp(`\n${escapeRegExp(string)}\n`)
            expect(content.match(exactMatch)).toBeTruthy()
        })
    }

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
        const output = String(execSync('./scripts/install.js')).trim()
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

    describe('ensureConfig', () => {
        it('updates exiting lines', async () => {
            const fileName = 'some-random-rc'
            const initial = `with
# -- specific existing line --
that should be replaced`
            const expected = `with
specific existing line
that should be replaced`
            fs.writeFileSync(fileName, initial)
            await ensureConfig(fileName, ['specific existing line'])
            expect(fs.readFileSync(fileName, 'utf8')).toEqual(expected)
            fs.unlinkSync(fileName)
        })
    })

    describe('local version', () => {
        beforeEach(() => {
            envHomeMock.mockValue(mockHomeValue)
            envUseLocal.mockValue(true)
            envInstallVersion.reset()
        })

        it('indicates successful completion', async () => {
            const config = getConfig()
            expect(config).toMatchSnapshot()
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
        it.each(rcFiles.map(file => [file]))('configures %s', async rcFile => {
            const filePath = `${mockHomeValue}/${rcFile}`
            fs.outputFileSync(filePath, '')
            await run()
            confirmShellConfig(filePath)
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
            expect(config).toMatchSnapshot()
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
        const installVersion = 'v2.4.0'
        const mockHome = 'another-mock-home'
        beforeEach(() => {
            envHomeMock.mockValue(mockHome)
            envUseLocal.reset()
            envInstallVersion.mockValue(installVersion)
        })

        afterAll(() => {
            fs.removeSync(mockHome)
        })

        it('indicates successful completion', async () => {
            const config = getConfig()
            expect(config).toMatchSnapshot()
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
            expect(version).toMatch(`${installVersion}`)
            // script is executable
            fs.accessSync(`${yvmHome}/yvm.sh`, fs.constants.X_OK)
        })
    })
})
