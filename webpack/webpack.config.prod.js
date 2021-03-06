const ZipFilesPlugin = require('zip-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

const { config, constants } = require('./webpack.config.base')

module.exports = Object.assign(config, {
    plugins: [
        ...config.plugins,
        new LodashModuleReplacementPlugin(),
        new ZipFilesPlugin({
            filename: 'yvm.zip',
            path: constants.paths.artifacts,
        }),
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    format: {
                        comments: /^\*\*?!|@preserve|@license|@cc_on/i,
                    },
                },
                extractComments: true,
            }),
        ],
    },
})
