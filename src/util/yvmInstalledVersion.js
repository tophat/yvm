const fs = require('fs')
const path = require('path')

const { yvmPath } = require('./path')
const log = require('./log')

const yvmInstalledVersion = (inYvmPath = yvmPath) => {
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
        log('Unable to determine installed version')
        log(e)
        return undefined
    }
}

module.exports = {
    yvmInstalledVersion,
}
