const os = require('os')
const fs = require('fs')
const { execSync } = require('child_process')
const https = require('https')
const path = require('path')
const url = require('url')

const log = (...args) => console.log(...args) // eslint-disable-line no-console

const zipFile = 'yvm.zip'
const binFile = 'yvm.js'
const releaseAssetsByPreference = [binFile, zipFile]

function getConfig() {
    const home = process.env.HOME || os.homedir()
    const useLocal = process.env.USE_LOCAL || false
    const yvmDir = process.env.YVM_INSTALL_DIR || path.join(home, '.yvm')
    const yvmGateway = 'https://d236jo9e8rrdox.cloudfront.net'
    const releaseApiUrl = path.join(yvmGateway, 'yvm-releases')
    return {
        paths: {
            home,
            yvm: yvmDir,
        },
        releaseApiUrl,
        releasesApiUrl: path.join(releaseApiUrl, 'all'),
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
    const { tag_name: tagName, assets } = data
    const assetsByName = assets.reduce(
        (acc, ass) => Object.assign(acc, { [ass.name]: ass }),
        {},
    )
    for (const name of releaseAssetsByPreference) {
        if (name in assetsByName) {
            const { browser_download_url: downloadUrl } = assetsByName[name]
            return { tagName, downloadUrl }
        }
    }
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

async function compatInstall({ paths, version }) {
    log(`Compatibility install: ${version.downloadUrl}`)
    const yvmCompatInstallScript = 'yvm-install-script'
    const yvmCompatDownloadPath = `https://raw.githubusercontent.com/tophat/yvm/${
        version.tagName
    }/scripts/install.`
    for (const [source, envBin] of [
        [`${yvmCompatDownloadPath}js`, 'node'],
        [`${yvmCompatDownloadPath}sh`, 'bash'],
    ]) {
        try {
            await downloadFile({ source, destination: yvmCompatInstallScript })
            execSync(
                `YVM_INSTALL_DIR='${paths.yvm}' INSTALL_VERSION='${
                    version.tagName
                }' ${envBin} ${yvmCompatInstallScript}`,
            )
                .toString()
                .split('\n')
                .forEach(l => log(l))
            return fs.unlinkSync(yvmCompatInstallScript)
        } catch (e) {
            continue
        }
    }
}

async function run() {
    const config = getConfig()
    const { version, paths, useLocal } = config
    ensureDir(paths.yvm)
    await cleanYvmDir(paths.yvm)

    const yvmBinFile = path.join(paths.yvm, binFile)
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
        if (version.downloadUrl.endsWith(zipFile)) {
            return compatInstall({ paths, version })
        }
        await downloadFile({
            source: version.downloadUrl,
            destination: yvmBinFile,
        })
    } else {
        const localBinFile = path.join('artifacts', 'webpack_build', binFile)
        fs.copyFileSync(localBinFile, yvmBinFile)
    }
    if (version.tagName) {
        log(`Installing Version: ${version.tagName}`)
    }

    const ongoingTasks = []
    if (version.tagName) {
        ongoingTasks.push(saveVersion(version.tagName, paths.yvm))
    }
    try {
        const configureCommand = [
            'node',
            yvmBinFile,
            'configure-shell',
            '--home',
            paths.home,
        ].join(' ')
        execSync(configureCommand)
    } catch (e) {
        log('Unable to configure shell')
    }
    await Promise.all(ongoingTasks)

    const sourceCommand = `source ${paths.yvm}/yvm.{sh,fish}`
    log(`yvm successfully installed in ${paths.yvm}
Open another terminal window to start using, or "${sourceCommand}"`)
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
    getTagAndUrlFromRelease,
    run,
}
