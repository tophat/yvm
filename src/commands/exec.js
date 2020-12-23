import path from 'path'
import { execFileSync } from 'child_process'

import { getSplitVersionAndArgs } from 'util/version'
import log from 'util/log'
import { yvmPath } from 'util/path'
import { ensureVersionInstalled } from 'commands/install'

const getYarnPath = (version, rootPath) =>
    path.resolve(rootPath, `versions/v${version}`)

const getExecutable = (version, rootPath) => {
    const yarnFilePath = path.resolve(
        getYarnPath(version, rootPath),
        'bin/yarn.js',
    )
    const isNVMIntegrationEnabled = process.env.YVM_NVM_INTEGRATION === '1'

    if (!isNVMIntegrationEnabled) {
        return [yarnFilePath]
    }

    const nvmExec = path.resolve(process.env.NVM_DIR, 'nvm-exec')
    return [nvmExec, yarnFilePath]
}

/**
 * __WARNING__
 * When changing this logic ensure that passing of stdio works correctly.
 * e.g. user input, arrows keys, etc.
 *
 * __TEST__
 * - `nvm use 8.0.0` (lowest supported node version)
 * - `make install`
 * - `yvm exec contributors:add` and go through the steps
 */
const runYarn = (version, extraArgs, rootPath = yvmPath) => {
    process.argv = ['', ''].concat(extraArgs)
    const [executable, ...execArgs] = getExecutable(version, rootPath)
    const args = [...execArgs, ...extraArgs]
    log.info(`${executable} ${args.join(' ')}`)
    try {
        execFileSync(executable, args, {
            stdio: 'inherit',
        })
    } catch (error) {
        log.info('yarn failed, non-zero exit')
        throw error
    }
}

export const exec = async (maybeVersion, rest = []) => {
    try {
        const [version, args] = await getSplitVersionAndArgs(
            maybeVersion,
            ...rest,
        )
        await ensureVersionInstalled(version)
        await runYarn(version, args)
        return 0
    } catch (e) {
        log(e.message)
        log.info(e.stack)
        return 1
    }
}
