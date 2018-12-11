const os = require('os')
const path = require('path')
const request = require('request')

const log = require('./log')
const { getDefaultVersion } = require('./version')
const yvmPath = process.env.YVM_DIR || path.resolve(os.homedir(), '.yvm')
const DEFAULT_VERSION_TEXT = 'Global Default'
const versionRootPath = rootPath => path.resolve(rootPath, 'versions')

const getExtractionPath = (version, rootPath) =>
    path.resolve(rootPath, 'versions', `v${version}`)

const stripVersionPrefix = tagName =>
    tagName[0] === 'v' ? tagName.substring(1) : tagName

const printVersions = ({
    list,
    message,
    versionInUse = '',
    defaultVersion = getDefaultVersion(yvmPath),
}) => {
    log(message)

    versionInUse = versionInUse.trim()

    const versionsMap = {}

    list.forEach(versionPadded => {
        const version = versionPadded.trim()

        let toLog =
            version === versionInUse
                ? ` \u2713 ${versionPadded}`
                : ` - ${versionPadded}`

        if (version === defaultVersion) toLog += ` (${DEFAULT_VERSION_TEXT})`
        if (version === versionInUse) {
            log('\x1b[32m%s\x1b[0m', toLog)
        } else {
            log(toLog)
        }

        versionsMap[version] = toLog
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
