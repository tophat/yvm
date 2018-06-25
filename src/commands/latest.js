const { getLatestVersion } = require('../common/utils')
const install = require('./install')
const log = require('../common/log')

module.exports = () =>
    getLatestVersion('yarnpkg', 'yarn')
        .then(version => install({ version, skipValidVersionCheck: true }))
        .catch(e => log('Failed to get latest version info', e))
