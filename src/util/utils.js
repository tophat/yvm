const path = require('path')
const request = require('request')

const { USER_AGENT } = require('./constants')
const log = require('./log')

const versionRootPath = rootPath => path.resolve(rootPath, 'versions')

const getExtractionPath = (version, rootPath) =>
    path.resolve(rootPath, 'versions', `v${version}`)

const stripVersionPrefix = tagName =>
    tagName[0] === 'v' ? tagName.substring(1) : tagName

const getReleasesFromTags = () => {
    const options = {
        url: 'https://d236jo9e8rrdox.cloudfront.net/yarn-releases',
        headers: {
            'User-Agent': USER_AGENT,
        },
    }

    return new Promise((resolve, reject) => {
        request.get(options, (error, response, body) => {
            if (error || response.statusCode !== 200) {
                if (response.body) {
                    if (error) {
                        log(error)
                    }
                    reject(response.body)
                    return
                }
                reject(error)
            } else {
                const tags = JSON.parse(body)
                const releases = tags.reduce((accumulator, tag) => {
                    const version = stripVersionPrefix(tag.name)
                    const [major] = version.split('.')
                    return Number(major) > 0
                        ? Object.assign(accumulator, { [version]: tag })
                        : accumulator
                }, {})
                resolve(releases)
            }
        })
    })
}

const getVersionsFromTags = async () => Object.keys(await getReleasesFromTags())

module.exports = {
    getExtractionPath,
    getReleasesFromTags,
    getVersionsFromTags,
    stripVersionPrefix,
    versionRootPath,
}
