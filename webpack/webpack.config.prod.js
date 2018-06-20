const ZipPlugin = require('zip-webpack-plugin')

const baseConfig = require('./webpack.config.base')
const GithubReleasePlugin = require('./githubReleasePlugin')

const zipfileName = 'yvm.zip'

const now = new Date().toISOString()
const releaseName = `test-release_name-${now}`
const releaseOptions = {
    auth: { token: process.env.GITHUB_TOKEN },
    name: releaseName,
    assets: [zipfileName],
}

baseConfig.mode = 'production'
baseConfig.plugins.push(
    new ZipPlugin({
        filename: zipfileName,
    }),
    new GithubReleasePlugin(releaseOptions),
)

module.exports = baseConfig
