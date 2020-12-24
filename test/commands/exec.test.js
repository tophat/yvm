import childProcess from 'child_process'

import { vol } from 'memfs'

import * as install from 'commands/install'
import { exec } from 'commands/exec'
import { yvmPath as rootPath } from 'util/path'
import log from 'util/log'

jest.spyOn(childProcess, 'execFileSync')
jest.spyOn(install, 'ensureVersionInstalled')
jest.spyOn(log, 'default')
jest.spyOn(log, 'info')
jest.mock('util/path', () => ({
    yvmPath: '/tmp/cmd/exec/yvm',
    getPathEntries: () => [],
}))

describe('exec command', () => {
    const rcVersion = '1.13.0'
    beforeAll(() => {
        vol.fromJSON({ '.yvmrc': `${rcVersion}\n` })
        childProcess.execFileSync.mockImplementation(() => {})
        install.ensureVersionInstalled.mockImplementation(() => {})
    })
    afterEach(jest.clearAllMocks)

    it('executes yarn with correct args', async () => {
        const version = '1.7.0'
        const args = ['extra', 'args']
        expect(await exec(version, args)).toBe(0)
        expect(install.ensureVersionInstalled).toHaveBeenCalledTimes(1)
        expect(
            childProcess.execFileSync,
        ).toHaveBeenCalledWith(
            `${rootPath}/versions/v${version}/bin/yarn.js`,
            args,
            { stdio: 'inherit' },
        )
    })

    it('executes yarn with correct rcVersion', async () => {
        expect(await exec()).toBe(0)
        expect(install.ensureVersionInstalled).toHaveBeenCalledTimes(1)
        expect(
            childProcess.execFileSync,
        ).toHaveBeenCalledWith(
            `${rootPath}/versions/v${rcVersion}/bin/yarn.js`,
            [],
            { stdio: 'inherit' },
        )
    })

    it('handles execution failure', async () => {
        const mockError = new Error('yarn internal error')
        childProcess.execFileSync.mockImplementationOnce(() => {
            throw mockError
        })
        expect(await exec()).toBe(1)
        expect(install.ensureVersionInstalled).toHaveBeenCalledTimes(1)
        expect(log.info).toHaveBeenCalledWith(
            expect.stringContaining('yarn failed'),
        )
        expect(log.default).toHaveBeenCalledWith(mockError.message)
        expect(log.info).toHaveBeenCalledWith(mockError.stack)
    })

    describe('custom bootstrap executable', () => {
        const originalEnvVars = {}

        beforeEach(() => {
            originalEnvVars.YVM_BOOTSTRAP_EXEC_PATH =
                process.env.YVM_BOOTSTRAP_EXEC_PATH
        })

        afterEach(() => {
            process.env.YVM_BOOTSTRAP_EXEC_PATH =
                originalEnvVars.YVM_BOOTSTRAP_EXEC_PATH
        })

        it('executes yarn via bootstrap script if one specified', async () => {
            process.env.YVM_BOOTSTRAP_EXEC_PATH = '/home/test/.nvm/nvm-exec'

            expect(await exec()).toBe(0)
            expect(install.ensureVersionInstalled).toHaveBeenCalledTimes(1)
            expect(childProcess.execFileSync).toHaveBeenCalledWith(
                process.env.YVM_BOOTSTRAP_EXEC_PATH,
                [`${rootPath}/versions/v${rcVersion}/bin/yarn.js`],
                { stdio: 'inherit' },
            )
        })

        it('executes yarn directly if no bootstrap script specified', async () => {
            process.env.YVM_BOOTSTRAP_EXEC_PATH = ''

            expect(await exec()).toBe(0)
            expect(
                childProcess.execFileSync,
            ).toHaveBeenCalledWith(
                `${rootPath}/versions/v${rcVersion}/bin/yarn.js`,
                [],
                { stdio: 'inherit' },
            )
        })
    })
})
