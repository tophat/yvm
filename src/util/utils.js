const os = require('os')
const path = require('path')
const request = require('request')

const log = require('./log')
const { getDefaultVersion } = require('./version')
const yvmPath = process.env.YVM_DIR || path.resolve(os.homedir(), '.yvm')
const GLOBAL_DEFAULT_VERSION_TEXT = 'Global Default'
const versionRootPath = rootPath => path.resolve(rootPath, 'versions')

const getExtractionPath = (version, rootPath) =>
    path.resolve(rootPath, 'versions', `v${version}`)

const stripVersionPrefix = tagName =>
    tagName[0] === 'v' ? tagName.substring(1) : tagName

const printVersions = (list, message, versionInUse = '') => {
    log(message)

    versionInUse = versionInUse.trim()

    const versionsMap = {}
    const defaultVersion = getDefaultVersion(yvmPath)

    list.forEach(item => {
        const itemTrimmed = item.trim()

        let toLog =
            itemTrimmed === versionInUse ? ` \u2713 ${item}` : ` - ${item}`

        if (itemTrimmed === defaultVersion)
            toLog += ` (${GLOBAL_DEFAULT_VERSION_TEXT})`
        if (itemTrimmed === versionInUse) {
            log('\x1b[32m%s\x1b[0m', toLog)
        } else {
            log(toLog)
        }

        versionsMap[itemTrimmed] = toLog
    })
    return versionsMap
}

const getVersionsFromTags = () => {
    const options = {
        url: 'https://api.github.com/repos/yarnpkg/yarn/tags',
        headers: {
            'User-Agent': 'YVM',
        },
    }

    return new Promise((resolve, reject) => {
        request.get(options, (error, response, body) => {
            if (error || response.statusCode !== 200) {
                reject(error)
            } else {
                const tags = JSON.parse(body)
                const tagNames = tags.map(tag => tag.name)
                const versions = tagNames
                    .map(stripVersionPrefix)
                    .filter(version => version[0] > 0)
                resolve(versions)
            }
        })
    })
}

module.exports = {
    getExtractionPath,
    getVersionsFromTags,
    printVersions,
    stripVersionPrefix,
    versionRootPath,
    yvmPath,
}
