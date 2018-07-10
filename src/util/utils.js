const fs = require('fs')
const os = require('os')
const path = require('path')
const request = require('request')

const installVersion = require('../commands/install')
const log = require('./log')

const yvmPath = process.env.YVM_DIR || path.resolve(os.homedir(), '.yvm')
const versionRootPath = rootPath => path.resolve(rootPath, 'versions')

const getExtractionPath = (version, rootPath) =>
    path.resolve(rootPath, 'versions', `v${version}`)

const stripVersionPrefix = tagName =>
    tagName[0] === 'v' ? tagName.substring(1) : tagName

const printVersions = (list, message) => {
    log(message)
    list.forEach(item => {
        log(`  - ${item}`)
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

const ensureVersionInstalled = (version, rootPath = yvmPath) => {
    const yarnBinDir = getExtractionPath(version, rootPath)
    if (fs.existsSync(yarnBinDir)) {
        return Promise.resolve()
    }
    return installVersion(version, rootPath)
}

module.exports = {
    ensureVersionInstalled,
    getExtractionPath,
    getVersionsFromTags,
    printVersions,
    stripVersionPrefix,
    versionRootPath,
    yvmPath,
}
