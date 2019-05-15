import os from 'os'
import path from 'path'
import fs from 'fs'

const isFishShell = shell => shell === 'fish'

export const getPathDelimiter = shell => {
    if (isFishShell(shell)) {
        return ' '
    }
    return path.delimiter
}

export const getCurrentPath = shell => {
    if (isFishShell(shell)) {
        return process.env.fish_user_paths || ''
    }
    return process.env.PATH || ''
}

export const getPathEntries = shell =>
    getCurrentPath(shell).split(getPathDelimiter(shell))

export const getYarnPathEntries = shell =>
    getPathEntries(shell).filter(p => fs.existsSync(path.join(p, 'yarn')))

export const yvmPath = process.env.YVM_DIR || path.resolve(os.homedir(), '.yvm')

export const isYvmPath = p => p.startsWith(yvmPath)

export const getNonYvmYarnPathEntries = shell =>
    getYarnPathEntries(shell).filter(p => !isYvmPath(p))
