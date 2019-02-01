const {
    getRcFileVersion,
    getValidVersionString,
    getVersionInUse,
} = require('../util/version')
const log = require('../util/log')
const { versionRootPath } = require('../util/utils')
const { yvmPath } = require('../util/path')

const whichCommand = async path => {
    const versionInUse = await getVersionInUse()
    if (!versionInUse) {
        log('Sorry, yarn is NOT installed.')
        return 1
    }
    const envPath = path || process.env.PATH
    if (!envPath) {
        log('Environment PATH not found.')
        return 1
    }

    let foundVersion = false

    const pathVariables = envPath.split(':')
    pathVariables.forEach(element => {
        if (element.startsWith(versionRootPath(yvmPath))) {
            const [pathVersion] = element
                .split('/')
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
            foundVersion = true
        }
        return 0
    })

    if (!foundVersion) {
        log("You don't have yvm version installed")
        return 2
    }

    return 0
}

module.exports = whichCommand
