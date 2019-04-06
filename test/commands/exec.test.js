import childProcess from 'child_process'
import fs from 'fs-extra'
// import path from 'path'
jest.spyOn(childProcess, 'execFileSync')
import * as install from '../../src/commands/install'
jest.spyOn(install, 'ensureVersionInstalled')
import { exec } from '../../src/commands/exec'
// import { yvmPath as rootPath } from '../../src/util/path'
import log from '../../src/util/log'

jest.spyOn(log, 'default')
jest.spyOn(log, 'info')
jest.mock('../../src/util/path', () => ({
    yvmPath: '/tmp/yvmInstall',
    getPathEntries: () => [],
}))

describe('exec command', () => {
    const rcVersion = '1.13.0'
    beforeAll(() => {
        fs.writeFileSync('.yvmrc', `${rcVersion}\n`)
        childProcess.execFileSync.mockImplementation(() => {})
        install.ensureVersionInstalled.mockImplementation(() => {})
    })
    afterEach(jest.clearAllMocks)

    it('executes yarn with correct args', async () => {
        const version = '1.7.0'
        const args = ['extra', 'args']
        expect(await exec(version, args)).toBe(0)
        expect(install.ensureVersionInstalled).toHaveBeenCalledTimes(1)
        expect(childProcess.execFileSync).toHaveBeenCalledWith(
            `/tmp/yvmInstall/versions/v${version}/bin/yarn.js`,
            args,
            { stdio: 'inherit' },
        )
    })

    it('executes yarn with correct rcVersion', async () => {
        expect(await exec()).toBe(0)
        expect(install.ensureVersionInstalled).toHaveBeenCalledTimes(1)
        expect(childProcess.execFileSync).toHaveBeenCalledWith(
            `/tmp/yvmInstall/versions/v${rcVersion}/bin/yarn.js`,
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
        expect(log.default).toHaveBeenCalledWith(
            expect.stringContaining('yarn failed'),
        )
        expect(log.default).toHaveBeenCalledWith(mockError.message)
        expect(log.info).toHaveBeenCalledWith(mockError.stack)
    })
})
