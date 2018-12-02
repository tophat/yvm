const log = require('../util/log')
const { yvmInstalledVersion } = require('../util/yvmInstalledVersion')

const yvmVersion = () => {
    const version = yvmInstalledVersion()
    if (version) {
        log.capturable(version)
        return 0
    } else {
        log('Unable to determine yvm version')
        return 1
    }
}

module.exports = yvmVersion
