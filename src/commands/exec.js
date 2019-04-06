import path from 'path'
import { execFileSync } from 'child_process'

import { ensureVersionInstalled } from './install'
import { getSplitVersionAndArgs } from '../util/version'
import log from '../util/log'
import { yvmPath } from '../util/path'

const getYarnPath = (version, rootPath) =>
    path.resolve(rootPath, `versions/v${version}`)

const runYarn = (version, extraArgs = ['-v'], rootPath = yvmPath) => {
    process.argv = ['', ''].concat(extraArgs)
    const filePath = path.resolve(getYarnPath(version, rootPath), 'bin/yarn.js')
    const command = `${filePath} ${extraArgs.join(' ')}`
    log.info(command)
    try {
        // WARNING :: When changing this logic ensure that passing of stdio works correctly. e.g. user input, arrows keys
        // test:
        // `nvm use 8.0.0` (lowest supported node version)
        // `make install`
        // `yvm exec contributors:add` and go through the steps
        execFileSync(filePath, extraArgs, {
            stdio: 'inherit',
        })
    } catch (error) {
        log(error.message)
        throw new Error('yarn failed, non-zero exit')
    }
}

export const exec = async (maybeVersion, rest) => {
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
