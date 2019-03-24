import os from 'os'
import path from 'path'

const isFishShell = shell => shell === 'fish'

export const getPathDelimiter = shell => {
    if (isFishShell(shell)) {
        return ' '
    }
    return path.delimiter
}

export const getCurrentPath = shell => {
    if (isFishShell(shell)) {
        return process.env.FISH_USER_PATHS || ''
    }
    return process.env.PATH || ''
}

export const getPathEntries = shell => {
    return getCurrentPath(shell).split(getPathDelimiter(shell))
}

export const yvmPath = process.env.YVM_DIR || path.resolve(os.homedir(), '.yvm')
