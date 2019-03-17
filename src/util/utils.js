const path = require('path')
const request = require('request')
const memoize = require('lodash.memoize')

const { USER_AGENT } = require('./constants')
const log = require('./log')

const versionRootPath = rootPath => path.resolve(rootPath, 'versions')

const getExtractionPath = (version, rootPath) =>
    path.resolve(rootPath, 'versions', `v${version}`)

const stripVersionPrefix = tagName =>
    tagName[0] === 'v' ? tagName.substring(1) : tagName

const getRequest = memoize(async url => {
    const options = {
        url,
        gzip: true,
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
                    return reject(response.body)
                }
                return reject(error)
            }
            return resolve(body)
        })
    })
})

const getReleasesFromTags = memoize(async () => {
    return getRequest(
        'https://d236jo9e8rrdox.cloudfront.net/yarn-releases',
    ).then(body => {
        return JSON.parse(body).reduce((accumulator, tag) => {
            const version = stripVersionPrefix(tag.name)
            const [major] = version.split('.')
            return Number(major) > 0
                ? Object.assign(accumulator, { [version]: tag })
                : accumulator
        }, {})
    })
})

const getVersionsFromTags = memoize(async () => {
    return Object.keys(await getReleasesFromTags())
})

module.exports = {
    getExtractionPath,
    getReleasesFromTags,
    getRequest,
    getVersionsFromTags,
    stripVersionPrefix,
    versionRootPath,
}
