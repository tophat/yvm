const path = require('path')

const baseConfig = require('./webpack.config.base')
const GithubReleasePlugin = require('./githubReleasePlugin')
const ZipFilesPlugin = require('webpack-zip-files-plugin')

const zipfileName = 'yvm.zip'

const currentDate = new Date()
const releaseName = currentDate.toUTCString()
const tagName = currentDate.toISOString().replace(/:/g, '-')

const outputPath = baseConfig.output.path
const nodeModulesPath = path.resolve(__dirname, '..', 'node_modules')

baseConfig.plugins.push(
    new ZipFilesPlugin({
        entries: [
            { src: outputPath, dist: '.' },
            { src: nodeModulesPath, dist: 'node_modules' },
        ],
        output: path.join(outputPath, 'yvm'),
        format: 'zip',
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
