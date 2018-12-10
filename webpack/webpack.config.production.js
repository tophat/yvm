const path = require('path')
const ZipFilesPlugin = require('webpack-zip-files-plugin')

const baseConfig = require('./webpack.config.base')

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
)

module.exports = baseConfig
