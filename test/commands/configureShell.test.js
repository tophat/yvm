import { fs, vol } from 'memfs'
import path from 'path'
import os from 'os'
import mockProps from 'jest-mock-props'
mockProps.extend(jest)

import log from 'util/log'
import { configureShell, ensureConfig } from 'commands/configureShell'

describe('configureShell', () => {
    const mockHomeValue = 'config-mock-home'
    const yvmDir = `${mockHomeValue}/.yvm`
    const envHomeMock = jest.spyOnProp(process.env, 'HOME')
    const mockInstallDir = 'config-mock-install-dir/.yvm'
    jest.spyOn(os, 'homedir')
    jest.spyOn(log, 'default')
    jest.spyOn(log, 'info')

    const fileToPath = ([file]) => path.join(mockHomeValue, file)
    const rcFiles = {
        bashrc: fileToPath`.bashrc`,
        bashpro: fileToPath`.bash_profile`,
        zshrc: fileToPath`.zshrc`,
        fishconf: fileToPath`.config/fish/config.fish`,
    }
    const rcFilePaths = Object.values(rcFiles)
    const confirmShellConfig = () => {
        const configs = rcFilePaths.reduce((configs, file) => {
            const content = fs.existsSync(file) && fs.readFileSync(file, 'utf8')
            return Object.assign(configs, { [file]: content || null })
        }, {})
        expect(configs).toMatchSnapshot()
    }

    beforeEach(() => {
        jest.clearAllMocks()
        const dummyContent = 'dummy'
        vol.fromJSON({
            [rcFiles.bashrc]: dummyContent,
            [rcFiles.bashpro]: dummyContent,
            [rcFiles.zshrc]: dummyContent,
            [rcFiles.fishconf]: dummyContent,
        })
    })

    afterEach(() => {
        envHomeMock.mockReset()
        vol.reset()
    })

    afterAll(jest.restoreAllMocks)

    it('configures only bashrc', async () => {
        expect(
            await configureShell({
                home: mockHomeValue,
                shell: 'bash',
                yvmDir: mockInstallDir,
            }),
        ).toBe(0)
        confirmShellConfig()
        expect(log.info).toHaveBeenCalledWith(
            expect.stringContaining('Configured'),
        )
        expect(log.info).toHaveBeenCalledWith(
            expect.stringContaining(rcFiles.bashrc),
        )
        expect(log.default).toHaveBeenCalledWith(
            'Shell configured successfully',
        )
    })

    it('configures only bash_profile when no bashrc', async () => {
        fs.unlinkSync(rcFiles.bashrc)
        expect(
            await configureShell({
                home: mockHomeValue,
                shell: 'bash',
                yvmDir: mockInstallDir,
            }),
        ).toBe(0)
        confirmShellConfig()
        expect(log.info).toHaveBeenCalledWith(
            expect.stringContaining('Configured'),
        )
        expect(log.info).toHaveBeenCalledWith(
            expect.stringContaining(rcFiles.bashpro),
        )
        expect(log.default).toHaveBeenCalledWith(
            'Shell configured successfully',
        )
    })

    it('configures only fish', async () => {
        envHomeMock.mockValue(mockHomeValue)
        expect(await configureShell({ shell: 'fish', yvmDir })).toBe(0)
        confirmShellConfig()
        expect(log.info).toHaveBeenCalledWith(
            expect.stringContaining('Configured'),
        )
        expect(log.info).toHaveBeenCalledWith(
            expect.stringContaining(rcFiles.fishconf),
        )
        expect(log.default).toHaveBeenCalledWith(
            'Shell configured successfully',
        )
    })

    it('configures only zsh', async () => {
        envHomeMock.mockValue()
        os.homedir.mockReturnValueOnce(mockHomeValue)
        expect(await configureShell({ shell: 'zsh', yvmDir })).toBe(0)
        confirmShellConfig()
        expect(log.info).toHaveBeenCalledWith(
            expect.stringContaining('Configured'),
        )
        expect(log.info).toHaveBeenCalledWith(
            expect.stringContaining(rcFiles.zshrc),
        )
        expect(log.default).toHaveBeenCalledWith(
            'Shell configured successfully',
        )
    })

    it('configures all', async () => {
        expect(await configureShell({ home: mockHomeValue, yvmDir })).toBe(0)
        confirmShellConfig()
        expect(log.info).toHaveBeenCalledWith(
            expect.stringContaining('Configured'),
        )
        expect(log.info).toHaveBeenCalledWith(
            expect.stringContaining(rcFiles.bashrc),
        )
        expect(log.info).toHaveBeenCalledWith(
            expect.stringContaining(rcFiles.fishconf),
        )
        expect(log.info).toHaveBeenCalledWith(
            expect.stringContaining(rcFiles.zshrc),
        )
        expect(log.default).toHaveBeenCalledWith(
            'Shell configured successfully',
        )
    })

    it('configures none', async () => {
        vol.reset()
        expect(await configureShell({ home: mockHomeValue })).toBe(1)
        rcFilePaths.forEach(file => expect(fs.existsSync(file)).toBe(false))
        confirmShellConfig()
        expect(log.default.mock.calls).toMatchSnapshot()
    })

    it('handle error', async () => {
        const mockError = new Error('mock error')
        os.homedir.mockImplementationOnce(() => {
            throw mockError
        })
        envHomeMock.mockValue()
        expect(await configureShell()).toBe(2)
        expect(log.default).toHaveBeenCalledWith(mockError.message)
        expect(log.info).toHaveBeenCalledWith(mockError.stack)
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
            vol.fromJSON({ [fileName]: initial })
            await ensureConfig(fileName, ['specific existing line'])
            expect(fs.readFileSync(fileName, 'utf8')).toEqual(expected)
            vol.reset()
        })
    })
})
