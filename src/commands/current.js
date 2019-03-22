const path = require('path')

const {
    getRcFileVersion,
    getValidVersionString,
    getVersionInUse,
} = require('../util/version')
const log = require('../util/log')
const { versionRootPath } = require('../util/utils')
const { getCurrentPath, getPathDelimiter, yvmPath } = require('../util/path')

const currentCommand = async ({ path: pathToUse, shell } = {}) => {
    const pathDelimiter = getPathDelimiter(shell)
    const versionInUse = await getVersionInUse()
    if (!versionInUse) {
        log('Sorry, yarn is NOT installed.')
        return 1
    }
    const envPath = pathToUse || getCurrentPath(shell)
    if (!envPath) {
        log('Environment PATH not found.')
        return 1
    }
    for (const element of envPath.split(pathDelimiter)) {
        if (element.startsWith(versionRootPath(yvmPath))) {
            const [pathVersion] = element
                .split(path.sep)
                .map(getValidVersionString)
                .filter(a => a)
            log.info(`matched yvm version: v${pathVersion} in PATH ${element}`)

            const rcVersion = getRcFileVersion()
            log(`Currently on yarn version ${pathVersion}`)
            if (rcVersion !== null) {
                if (pathVersion === rcVersion) {
                    log(
                        'Your .yvmrc version matches your PATH version, good job!',
                    )
                } else {
                    log(
                        `Your .yvmrc version: ${rcVersion} and PATH version: ${pathVersion} don't match :(`,
                    )
                }
            }
            return 0
        }
    }
    log('Yarn was NOT installed by yvm')
    return 2
}

module.exports = currentCommand
