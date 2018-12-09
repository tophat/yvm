const { getActiveVersion, getRcFileVersion } = require('../util/version')
const log = require('../util/log')

const whichCommand = () => {
    getActiveVersion()
        .catch(() => log('Sorry, yarn in NOT installed.'))
        .then(activeVersion => {
            log(`Found yarn version: ${activeVersion}`)
            const rcVersion = getRcFileVersion()
            if (rcVersion !== null) {
                if (activeVersion === rcVersion) {
                    log.success(
                        'Your RC version matches your PATH version, good job! :)',
                    )
                } else {
                    log.error(
                        `Your RC version: ${rcVersion} and ACTIVE version: ${activeVersion} don't match :(`,
                    )
                    log('Run `yvm use` to switch to RC version')
                }
            }
        })
        .catch(e => log.error(e))
}

module.exports = whichCommand
