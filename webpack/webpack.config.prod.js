const ZipPlugin = require('zip-webpack-plugin')

const baseConfig = require('./webpack.config.base')
const GithubReleasePlugin = require('./githubReleasePlugin')

const zipfileName = 'yvm.zip'

baseConfig.mode = 'production'
baseConfig.plugins.push(
    new ZipPlugin({
        filename: zipfileName,
    }),
    new GithubReleasePlugin({
        auth: { token: process.env.GITHUB_TOKEN },
        assets: [zipfileName],
    }),
)

module.exports = baseConfig
