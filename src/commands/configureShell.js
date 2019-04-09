import fs from 'fs-extra'
import os from 'os'
import path from 'path'

import escapeRegExp from 'lodash.escaperegexp'

import log from '../util/log'

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
    return configured
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
    return configured
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
    return configured
}

export const configureShell = async ({ home, shell = '' } = {}) => {
    try {
        const userHome = home || process.env.HOME || os.homedir()
        const yvmDir =
            process.env.YVM_INSTALL_DIR || path.join(userHome, '.yvm')
        const configHandlers = {
            bash: configureBash,
            fish: configureFish,
            zsh: configureZsh,
        }
        const updatingShellConfigs = []
        for (const supportedShell of Object.keys(configHandlers)) {
            if (supportedShell.includes(shell)) {
                updatingShellConfigs.push(
                    configHandlers[supportedShell]({ home: userHome, yvmDir }),
                )
            }
        }
        const result = await Promise.all(updatingShellConfigs)
        const allSuccessful = result.every(a => a)
        const anySuccessful = result.some(a => a)
        const isSuccessful = allSuccessful || (anySuccessful && !shell)
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
