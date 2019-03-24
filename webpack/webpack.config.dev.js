const WebpackShellPlugin = require('webpack-shell-plugin-next')

const baseConfig = require('./webpack.config.base')

Object.assign(baseConfig, {
    mode: 'development',
    plugins: [
        ...baseConfig.plugins,
        new WebpackShellPlugin({
            onBuildExit: {
                scripts: ['source src/yvm.sh'],
                blocking: true,
            },
        }),
    ],
})

module.exports = baseConfig
