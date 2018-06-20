const os = require('os')
const path = require('path')
const request = require('request')

const log = require('../common/log')

const yvmPath = path.resolve(os.homedir(), '.yvm')
const versionRootPath = path.resolve(yvmPath, 'versions')

const getExtractionPath = version =>
    path.resolve(versionRootPath, `v${version}`)

const getVersionsFromTags = () => {
    const options = {
        url: 'https://api.github.com/repos/yarnpkg/yarn/tags',
        headers: {
            'User-Agent': 'YVM',
        },
    }

    return new Promise((resolve, reject) => {
        request.get(options, (error, response, body) => {
            if (error || response.statusCode != 200) {
                reject(error)
            } else {
                const tags = JSON.parse(body)
                const tagNames = tags.map(tag => tag.name)
                const versions = tagNames.map(stripVersionPrefix)
                resolve(versions)
            }
        })
    })
}

const stripVersionPrefix = tagName =>
    tagName[0] === 'v' ? tagName.substring(1) : tagName

const printVersions = (list, message) => {
    log(message)
    list.forEach(item => {
        log(`  - ${item}`)
    })
}

module.exports = {
    getExtractionPath,
    getVersionsFromTags,
    printVersions,
    stripVersionPrefix,
    versionRootPath,
}
