const os = require('os')
const path = require('path')
const request = require('request')

const log = require('./log')

const yvmPath = process.env.YVM_DIR || path.resolve(os.homedir(), '.yvm')
const versionRootPath = rootPath => path.resolve(rootPath, 'versions')

const getExtractionPath = (version, rootPath) =>
    path.resolve(rootPath, 'versions', `v${version}`)

const stripVersionPrefix = tagName =>
    tagName[0] === 'v' ? tagName.substring(1) : tagName

const printVersions = (list, versionInUse, message) => {
    log(message)

    versionInUse = versionInUse.trim()

    list.forEach(item => {
        if (item.trim() === versionInUse) {
            log('\x1b[32m%s\x1b[0m', ` \u2713 ${item}`)
        } else {
            log(` - ${item}`)
        }
    })
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
