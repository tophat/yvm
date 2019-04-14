const os = require('os')
const fs = require('fs')
const { execSync } = require('child_process')
const https = require('https')
const path = require('path')
const url = require('url')

const log = (...args) => console.log(...args) // eslint-disable-line no-console

function getConfig() {
    const home = process.env.HOME || os.homedir()
    const useLocal = process.env.USE_LOCAL || false
    const yvmDir = process.env.YVM_INSTALL_DIR || path.join(home, '.yvm')
    return {
        paths: {
            home,
            yvm: yvmDir,
            yvmSh: path.join(yvmDir, 'yvm.sh'),
        },
        releaseApiUrl: 'https://d236jo9e8rrdox.cloudfront.net/yvm-releases',
        releasesApiUrl: 'https://api.github.com/repos/tophat/yvm/releases',
        useLocal,
        version: {
            tagName: process.env.INSTALL_VERSION || null,
        },
    }
}

/**
 * Ensures a directory exists, creating the target
 * directory and all ancestor directories if necessary.
 *
 * Equivalent to `mkdir -p $dirPath`.
 *
 * @param {string} dirPath
 */
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        const directories = path.resolve(dirPath).split(path.sep)
        let baseDir = directories.shift() || path.sep
        for (const dirname of directories) {
            baseDir = path.join(baseDir, dirname)
            if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir)
        }
    }
}

function getTagAndUrlFromRelease(data) {
    const {
        tag_name: tagName,
        assets: [{ browser_download_url: downloadUrl }],
    } = data
    return { tagName, downloadUrl }
}

async function getYvmVersion(versionTag, releasesApiUrl) {
    const data = await downloadFile({ source: releasesApiUrl })
    for (const release of JSON.parse(data)) {
        const { tagName } = getTagAndUrlFromRelease(release)
        if (tagName.match(new RegExp(versionTag))) {
            return getTagAndUrlFromRelease(release)
        }
    }
    return {}
}

async function getLatestYvmVersion(releaseApiUrl) {
    const data = await downloadFile({ source: releaseApiUrl })
    return getTagAndUrlFromRelease(JSON.parse(data))
}

/**
 * Tests whether an http response contains a redirect.
 * @param {http.ServerResponse} response
 */
function httpResponseIsRedirect({ headers: { location } }) {
    return location && location.startsWith('https:')
}

/**
 * Pipes a http response to a destination file.
 * @param {http.ServerResponse} response
 * @param {string} destination
 */
async function httpResponseToFile(response, destination) {
    return new Promise(resolve => {
        const file = fs.createWriteStream(destination)
        response.pipe(file)
        file.on('finish', () => file.close(resolve))
    })
}

/**
 * Reads an http response into a string.
 * @param {http.ServerResponse} response
 */
async function httpResponseToString(response) {
    return new Promise(resolve => {
        let output = ''
        response.setEncoding('utf8')
        response.on('data', chunk => (output += chunk))
        response.on('end', () => resolve(output))
    })
}

/**
 * Returns https.get request options with default headers,
 * for a specified URI.
 * @param {string} uri
 */
function httpRequest(uri) {
    const { hostname, pathname, search } = new url.URL(uri)
    return {
        hostname,
        path: `${pathname}${search}`,
        method: 'GET',
        headers: { 'User-Agent': 'YVM' },
    }
}

/**
 * Downloads a file from a "source" URL to a local
 * target "destination". If destination is omitted,
 * the file's contents is returned directly.
 *
 * Only supports source URLs with the https scheme.
 *
 * @param {{ source: string, destination: string }} params
 */
async function downloadFile({ source, destination }) {
    return new Promise((resolve, reject) => {
        if (!source.startsWith('https'))
            return reject(
                new Error(
                    `Only https scheme is supported for file download. ` +
                        `Cannot download: ${source}.`,
                ),
            )

        return https.get(httpRequest(source), response => {
            const { statusCode, headers } = response
            if (statusCode >= 400)
                return reject(
                    new Error(
                        `Failed to download file "${source}". Status: ${statusCode}`,
                    ),
                )

            if (httpResponseIsRedirect(response)) {
                return downloadFile({
                    source: headers.location,
                    destination,
                }).then(resolve, reject)
            }

            const handleOutput = destination
                ? httpResponseToFile(response, destination)
                : httpResponseToString(response)
            return handleOutput.then(resolve, reject)
        })
    })
}

async function removeFile(maybeDir, recurse = false) {
    if (!fs.existsSync(maybeDir)) return
    if (fs.lstatSync(maybeDir).isDirectory() && recurse) {
        fs.readdirSync(maybeDir).forEach(file => {
            const maybeFile = path.join(maybeDir, file)
            removeFile(maybeFile, recurse)
        })
        fs.rmdirSync(maybeDir)
    } else {
        fs.unlinkSync(maybeDir)
    }
}

async function cleanYvmDir(yvmPath) {
    const filesNotToRemove = new Set(['versions'])
    const filesToRemove = fs
        .readdirSync(yvmPath)
        .filter(f => !filesNotToRemove.has(f))
    await Promise.all(
        filesToRemove.map(file =>
            removeFile(path.join(yvmPath, file), true).catch(log),
        ),
    )
}

async function saveVersion(version, yvmPath) {
    const filePath = path.join(yvmPath, '.version')
    fs.writeFileSync(filePath, JSON.stringify({ version }))
}

async function run() {
    const config = getConfig()
    const { version, paths, useLocal } = config
    ensureDir(paths.yvm)
    if (!useLocal) {
        const { releaseApiUrl, releasesApiUrl } = config
        if (version.tagName) {
            log('Querying github release API to determine version tag')
            const result = await getYvmVersion(version.tagName, releasesApiUrl)
            if (!result.tagName) {
                throw new Error(`No release version '${version.tagName}'`)
            }
            Object.assign(version, result)
        } else {
            log('Querying github release API to determine latest version')
            Object.assign(version, await getLatestYvmVersion(releaseApiUrl))
        }
        await downloadFile({
            source: version.downloadUrl,
            destination: path.join(paths.yvm, 'yvm.js'),
        })
    }
    if (version.tagName) {
        log(`Installing Version: ${version.tagName}`)
    }
    await cleanYvmDir(paths.yvm)

    const ongoingTasks = []
    if (version.tagName) {
        ongoingTasks.push(saveVersion(version.tagName, paths.yvm))
    }
    try {
        const configureCommand = [
            'node',
            path.join(paths.yvm, 'yvm.js'),
            'configure-shell',
            '--home',
            paths.home,
        ].join(' ')
        execSync(configureCommand)
    } catch (e) {
        log('Unable to configure shell')
    }
    await Promise.all(ongoingTasks)

    log(`yvm successfully installed in ${paths.yvm} as ${paths.yvmSh}
Open another terminal window to start using, or type "source ${paths.yvmSh}"`)
}

if (!module.parent) {
    run().catch(error => {
        log('yvm installation failed')
        log(error.message)
    })
}

module.exports = {
    downloadFile,
    getConfig,
    run,
}
