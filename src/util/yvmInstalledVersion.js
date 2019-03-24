import fs from 'fs'
import path from 'path'

import { yvmPath } from './path'
import log from './log'

export const yvmInstalledVersion = (inYvmPath = yvmPath) => {
    const versionStoragePath = path.join(inYvmPath, '.version')
    try {
        const versionJSONString = fs.readFileSync(versionStoragePath, 'utf8')
        const versionJSON = JSON.parse(versionJSONString)
        const version = versionJSON.version
        if (!version) {
            throw new Error(`Version JSON exists but contains no key 'version'`)
        }
        return version
    } catch (e) {
        log.info(e)
        return undefined
    }
}
