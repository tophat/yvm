const ZipPlugin = require('zip-webpack-plugin')
const baseConfig = require('./webpack.config.base')
const GithubReleasePlugin = require('./githubReleasePlugin')

const zipfileName = 'yvm.zip'

const currentDate = new Date()
const releaseName = currentDate.toUTCString()
const tagName = currentDate.toISOString().replace(/:/g, '-')
baseConfig.plugins.push(
    new ZipPlugin({
        filename: zipfileName,
    }),
    new GithubReleasePlugin({
        auth: { token: process.env.GITHUB_TOKEN },
        name: releaseName,
        tag_name: tagName,
        body: ' ',
        assets: [zipfileName],
    }),
)

module.exports = baseConfig
