const baseConfig = require('./webpack.config.base')
const WebpackShellPlugin = require('webpack-shell-plugin-next')

baseConfig.mode = 'development'

const basePlugins = baseConfig.plugins
baseConfig.plugins = [
    ...basePlugins,
    new WebpackShellPlugin({
        onBuildExit: {
            scripts: ['source src/yvm.sh'],
            blocking: true,
        },
    }),
]

module.exports = baseConfig
