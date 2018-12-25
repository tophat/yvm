const path = require('path')
const request = require('request')

const log = require('./log')

const versionRootPath = rootPath => path.resolve(rootPath, 'versions')

const getExtractionPath = (version, rootPath) =>
    path.resolve(rootPath, 'versions', `v${version}`)

const stripVersionPrefix = tagName =>
    tagName[0] === 'v' ? tagName.substring(1) : tagName

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
                if (response.body) {
                    if (error) {
                        log(error)
                    }
                    // Temp code while we figure out github rate limit
                    if (
                        response.body.indexOf('API rate limit exceeded') !== -1
                    ) {
                        reject(
                            `GitHub API rate limit exceeded.
Github recently changed their rate-limiting.
We are working on making this better in yvm!!
see: https://github.com/tophat/yvm/issues/255 for details`,
                        )
                        return
                    }
                    reject(response.body)
                    return
                }
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
    stripVersionPrefix,
    versionRootPath,
}
