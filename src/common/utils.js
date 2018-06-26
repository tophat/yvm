const os = require('os')
const path = require('path')
const request = require('request')

const log = require('../common/log')

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

const githubApiRequest = apiPath => {
    const options = {
        url: `https://api.github.com/${apiPath}`,
        headers: {
            'User-Agent': 'YVM',
        },
    }

    return new Promise((resolve, reject) => {
        request.get(options, (error, response) => {
            if (error || response.statusCode !== 200) {
                reject(error || response.body)
            } else {
                resolve(JSON.parse(response.body))
            }
        })
    })
}

const getVersionsFromTags = () =>
    githubApiRequest('repos/yarnpkg/yarn/tags').then(tags => {
        const tagNames = tags.map(tag => tag.name)
        return tagNames
            .map(stripVersionPrefix)
            .filter(version => version[0] > 0)
    })

const getLatestVersion = (owner, repo) =>
    githubApiRequest(`repos/${owner}/${repo}/releases/latest`).then(
        releaseInfo => stripVersionPrefix(releaseInfo.tag_name),
    )

module.exports = {
    getExtractionPath,
    getLatestVersion,
    getVersionsFromTags,
    printVersions,
    stripVersionPrefix,
    versionRootPath,
    yvmPath,
}
