import bashScript from '!!raw-loader!shell/yvm.sh'
import fishScript from '!!raw-loader!shell/yvm.fish'
import yarnShim from '!!raw-loader!shell/yarn_shim.js'

import os from 'os'
import path from 'path'
import log from 'util/log'
import { yvmPath } from 'util/path'

import { escapeRegExp } from 'lodash'
import fs from 'fs-extra'

/**
 * Helper utility for unpacking an executable script
 * from yvm.js into a target file. Is a no-op if the
 * target file already exists.
 */
const unpackShellScript = (content, filename) => {
    if (!fs.existsSync(filename)) {
        fs.outputFileSync(filename, content, {
            encoding: 'utf8',
            mode: 0o755,
        })
    }
    return true
}

export async function ensureConfig(configFile, configLines) {
    if (!fs.existsSync(configFile)) return false
    let contents = fs.readFileSync(configFile, 'utf8')
    const linesAppended = configLines.map(string => {
        const finalString = `\n${string}`
        if (contents.includes(string)) {
            const matchString = new RegExp(`\n.*${escapeRegExp(string)}.*`)
            contents = contents.replace(matchString, finalString)
            return false
        }
        contents += finalString
        return true
    })
    if (linesAppended.some(a => a)) {
        contents += '\n'
    }
    fs.writeFileSync(configFile, contents)
    log.info(`Configured '${configFile}'`)
    return true
}

const yvmDirVarName = 'YVM_DIR'

export const configureBash = async ({ home, profile, yvmDir }) => {
    const configFiles = [
        profile,
        path.join(home, '.bashrc'),
        path.join(home, '.bash_profile'),
    ].filter(Boolean)
    const shFile = 'yvm.sh'
    const shPathVariable = path.join(yvmDirVarName, shFile)
    const bashConfig = [
        `export ${yvmDirVarName}=${yvmDir}`,
        `[ -r $${shPathVariable} ] && . $${shPathVariable}`,
    ]
    for (const file of configFiles) {
        if (await ensureConfig(file, bashConfig)) {
            return unpackShellScript(bashScript, path.join(yvmDir, shFile))
        }
    }
    log('Unable to configure BASH at', configFiles.join(' or '))
}

export const configureFish = async ({ home, profile, yvmDir }) => {
    const configFiles = [
        profile,
        path.join(home, '.config', 'fish', 'config.fish'),
    ].filter(Boolean)
    const fishFile = 'yvm.fish'
    const fishConfig = [
        `set -x ${yvmDirVarName} ${yvmDir}`,
        `. $${path.join(yvmDirVarName, fishFile)}`,
    ]
    for (const file of configFiles) {
        if (await ensureConfig(file, fishConfig)) {
            return unpackShellScript(fishScript, path.join(yvmDir, fishFile))
        }
    }
    log('Unable to configure FISH at', configFiles.join(' or '))
}

export const configureZsh = async ({ home, profile, yvmDir }) => {
    const configFiles = [profile, path.join(home, '.zshrc')].filter(Boolean)
    const zshFile = 'yvm.sh'
    const shPathVariable = path.join(yvmDirVarName, zshFile)
    const zshConfig = [
        `export ${yvmDirVarName}=${yvmDir}`,
        `[ -r $${shPathVariable} ] && . $${shPathVariable}`,
    ]
    for (const file of configFiles) {
        if (await ensureConfig(file, zshConfig)) {
            return unpackShellScript(bashScript, path.join(yvmDir, zshFile))
        }
    }
    log('Unable to configure ZSH at', configFiles.join(' or '))
}

export const configureShim = async ({ yvmDir }) => {
    const shimFile = path.join(yvmDir, 'shim', 'yarn')
    return unpackShellScript(yarnShim, shimFile)
}

export const configureShell = async ({
    home,
    shim = true,
    shell = '',
    profile = null,
    yvmDir = yvmPath,
} = {}) => {
    try {
        const userHome = home || process.env.HOME || os.homedir()
        const config = { home: userHome, profile, yvmDir }
        const configHandlers = {
            bash: configureBash,
            fish: configureFish,
            zsh: configureZsh,
        }
        const configHandler = sh => configHandlers[sh](config)
        const configShells = Object.keys(configHandlers)
        const supportedShells = configShells.filter(sh => sh.includes(shell))
        const updatingShellConfigs = [].concat(
            profile && !shell
                ? supportedShells.reduce(
                      (conf, sh) => conf.then(r => r || configHandler(sh)),
                      Promise.resolve(false),
                  )
                : supportedShells.map(configHandler),
        )
        const shimSuccessful = shim
            ? configureShim({ yvmDir })
            : Promise.resolve(true)
        const result = await Promise.all(updatingShellConfigs)
        const allSuccessful = result.every(Boolean)
        const anySuccessful = result.some(Boolean)
        const isSuccessful =
            (allSuccessful || (anySuccessful && !shell)) &&
            (await shimSuccessful)
        if (!isSuccessful) {
            return 1
        }
        log('Shell configured successfully')
        return 0
    } catch (e) {
        log(e.message)
        log.info(e.stack)
        return 2
    }
}
