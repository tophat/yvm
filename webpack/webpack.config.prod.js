const path = require('path')
const ZipFilesPlugin = require('webpack-zip-files-plugin')

const baseConfig = require('./webpack.config.base')

const outputPath = baseConfig.output.path
const rootPath = path.resolve(__dirname, '..')
const artifactsPath = path.resolve(rootPath, 'artifacts')
const nodeModulesProductionPath = path.resolve(
    rootPath,
    'node_modules_production',
)

Object.assign(baseConfig, {
    plugins: [
        ...baseConfig.plugins,
        new ZipFilesPlugin({
            entries: [
                { src: outputPath, dist: '.' },
                { src: nodeModulesProductionPath, dist: 'node_modules' },
            ],
            output: path.join(artifactsPath, 'yvm'),
            format: 'zip',
        }),
    ],
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
})

module.exports = baseConfig
