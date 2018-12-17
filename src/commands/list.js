const fs = require('fs')
const { exec } = require('shelljs')

const log = require('../util/log')
const { stripVersionPrefix, versionRootPath } = require('../util/utils')
const { printVersions } = require('../util/version')
const { yvmPath } = require('../util/path')

const getYarnVersions = rootPath => {
    const re = /^v(\d+\.)(\d+\.)(\d+)$/
    if (fs.existsSync(versionRootPath(rootPath))) {
        return fs
            .readdirSync(versionRootPath(rootPath))
            .filter(file => re.test(file))
            .map(stripVersionPrefix)
    }
    return []
}

const listVersions = (rootPath = yvmPath) => {
    const installedVersions = getYarnVersions(rootPath)
    if (installedVersions.length) {
        const message = 'Installed yarn versions:'
        exec(
            'yarn --version',
            { async: true, silent: true },
            (code, stdout) => {
                const versionInUse = stdout
                printVersions({
                    list: installedVersions,
                    message,
                    versionInUse,
                })
            },
        )
    } else {
        log('You have no yarn versions installed.')
    }
    return installedVersions
}

module.exports = listVersions
