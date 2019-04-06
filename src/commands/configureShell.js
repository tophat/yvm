import fs from 'fs-extra'
import os from 'os'
import path from 'path'

import log from '../util/log'

/**
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
 * @param {string} src to be escaped
 */
export function escapeRegExp(src) {
    return src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function ensureConfig(configFile, configLines) {
    if (!fs.existsSync(configFile)) return false
    let contents = fs.readFileSync(configFile).toString()
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
    log(`Configured '${configFile}'`)
    return true
}

const yvmDirVarName = 'YVM_DIR'

export const configureBash = async ({ home, yvmDir }) => {
    const bashRcFile = path.join(home, '.bashrc')
    const bashProFile = path.join(home, '.bash_profile')
    const shPath = path.join(yvmDirVarName, 'yvm.sh')
    const bashConfig = [
        `export ${yvmDirVarName}=${yvmDir}`,
        `[ -r $${shPath} ] && . $${shPath}`,
    ]
    let configured = false
    if (fs.existsSync(bashRcFile)) {
        configured = await ensureConfig(bashRcFile, bashConfig)
    } else if (fs.existsSync(bashProFile)) {
        configured = await ensureConfig(bashProFile, bashConfig)
    }
    if (!configured) {
        log('Unable to configure BASH at', bashRcFile, 'or', bashProFile)
    }
}

export const configureFish = async ({ home, yvmDir }) => {
    const configFile = path.join(home, '.config', 'fish', 'config.fish')
    const fishPath = path.join(yvmDirVarName, 'yvm.fish')
    const configured = await ensureConfig(configFile, [
        `set -x ${yvmDirVarName} ${yvmDir}`,
        `. $${fishPath}`,
    ])
    if (!configured) {
        log('Unable to configure FISH at', configFile)
    }
}

export const configureZsh = async ({ home, yvmDir }) => {
    const shPath = path.join(yvmDirVarName, 'yvm.sh')
    const configFile = path.join(home, '.zshrc')
    const configured = await ensureConfig(configFile, [
        `export ${yvmDirVarName}=${yvmDir}`,
        `[ -r $${shPath} ] && . $${shPath}`,
    ])
    if (!configured) {
        log('Unable to configure ZSH at', configFile)
    }
}

export const configureShell = async ({ home, shell = '' }) => {
    const userHome = home || process.env.HOME || os.homedir()
    const yvmDir = process.env.YVM_INSTALL_DIR || path.join(userHome, '.yvm')
    const configHandlers = {
        bash: configureBash,
        fish: configureFish,
        zsh: configureZsh,
    }
    const updatingShellConfigs = []
    try {
        for (const supportedShell of Object.keys(configHandlers)) {
            if (supportedShell.includes(shell)) {
                updatingShellConfigs.push(
                    configHandlers[supportedShell]({ home: userHome, yvmDir }),
                )
            }
        }
        await Promise.all(updatingShellConfigs)
        return 0
    } catch (e) {
        log(e.message)
        log.info(e.stack)
        return 1
    }
}
