const ZipPlugin = require('zip-webpack-plugin')

const baseConfig = require('./webpack.config.base')

baseConfig.plugins.push(
    new ZipPlugin({
        filename: 'yvm.zip',
    }),
)

module.exports = baseConfig
