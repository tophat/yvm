/* eslint-disable no-console */
const path = require('path')

const ghRelease = require('gh-release')

const YVM_ZIP_FILE = path.join(process.cwd(), '/artifacts/yvm.zip')

const releaseVersion = process.env.VERSION

if (!releaseVersion || releaseVersion.length < 1) {
    console.log('No release version set, not deploying')
    process.exit(1)
}

const releaseVersionWithV = `v${releaseVersion}`

const options = {
    auth: { token: process.env.GITHUB_TOKEN },
    name: releaseVersionWithV,
    tag_name: releaseVersionWithV,
    body: ' ',
    assets: [YVM_ZIP_FILE],
    workpath: '',
}

new Promise(resolve => {
    ghRelease(options, (err, result) => {
        if (err) {
            console.error(err) // eslint-disable-line no-console
            process.exit(1)
        }
        console.log(result) // eslint-disable-line no-console
        resolve()
    })
})
