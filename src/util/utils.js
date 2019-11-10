import path from 'path'

import request from 'request'
import { memoize } from 'lodash'

import {
    USER_AGENT,
    YARN_DOWNLOAD_URL,
    YARN_RELEASES_API_URL,
} from 'util/constants'
import log from 'util/log'

export const shimRootPath = rootPath => path.resolve(rootPath, 'shim')
export const versionRootPath = rootPath => path.resolve(rootPath, 'versions')

export const getExtractionPath = (version, rootPath) =>
    path.resolve(rootPath, 'versions', `v${version}`)

export const stripVersionPrefix = tagName =>
    tagName[0] === 'v' ? tagName.substring(1) : tagName

export const getRequest = memoize(async url => {
    const options = {
        url,
        gzip: true,
        headers: {
            'User-Agent': USER_AGENT,
        },
    }
    return new Promise((resolve, reject) => {
        request.get(options, (error, response, body) => {
            const { statusCode, body: responseBody } = response || {}
            if (error || statusCode !== 200) {
                if (responseBody) {
                    if (error) {
                        log(error)
                    }
                    return reject(new Error(responseBody))
                }
                return reject(error)
            }
            return resolve(body)
        })
    })
})

export const getVersionDownloadUrl = version =>
    `${YARN_DOWNLOAD_URL}/${version}/yarn-v${version}.tar.gz`

export const getReleasesFromTags = memoize(async () => {
    return getRequest(YARN_RELEASES_API_URL).then(body => {
        return JSON.parse(body).reduce((accumulator, tag) => {
            const version = stripVersionPrefix(tag.name)
            const [major] = version.split('.')
            return Number(major) > 0
                ? Object.assign(accumulator, { [version]: tag })
                : accumulator
        }, {})
    })
})

export const getVersionsFromTags = memoize(async () => {
    try {
        return Object.keys(await getReleasesFromTags())
    } catch (e) {
        log.error(
            'Unable to retrieve remote versions. Please check your network connection',
        )
        return []
    }
})
