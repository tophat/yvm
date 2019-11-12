import os from 'os'
import path from 'path'
import fs from 'fs'

import { negate } from 'lodash'

import { shimRootPath, versionRootPath } from 'util/utils'

const isFishShell = shell => shell === 'fish'

const isYvmVersionPath = ({ p, rootPath = yvmPath }) =>
    p.startsWith(versionRootPath(rootPath))

const isShimPath = p => p && p.endsWith(shimRootPath(yvmPath))

export const getPathDelimiter = shell => {
    if (isFishShell(shell)) {
        return ' '
    }
    return path.delimiter
}

export const toPathString = ({ shell, paths }) =>
    paths.join(getPathDelimiter(shell)).trim()

export const getCurrentPath = shell => {
    if (isFishShell(shell)) {
        return process.env.fish_user_paths || ''
    }
    return process.env.sh_user_paths || process.env.PATH || ''
}

export const yvmPath = process.env.YVM_DIR || path.resolve(os.homedir(), '.yvm')

export const isYvmPath = p => p && p.startsWith(yvmPath)

export const getPathEntries = shell =>
    getCurrentPath(shell).split(getPathDelimiter(shell))

export const getNonYvmPathEntries = shell =>
    getPathEntries(shell).filter(negate(isYvmPath))

export const getNonYvmVersionPathEntries = ({ shell, rootPath = yvmPath }) =>
    getPathEntries(shell).filter(p => !isYvmVersionPath({ p, rootPath }))

export const getNonYvmShimPathEntries = shell =>
    getPathEntries(shell).filter(negate(isShimPath))

export const getYarnPathEntries = shell =>
    getPathEntries(shell)
        .map(p => path.join(p, 'yarn'))
        .filter(fs.existsSync)

export const getNonYvmYarnPathEntries = shell =>
    getYarnPathEntries(shell).filter(negate(isYvmPath))
