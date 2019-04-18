const WebpackShellPlugin = require('webpack-shell-plugin-next')

const { config } = require('./webpack.config.base')

module.exports = Object.assign(config, {
    mode: 'development',
    plugins: [
        ...config.plugins,
        new WebpackShellPlugin({
            onBuildExit: {
                scripts: ['source src/yvm.sh'],
                blocking: true,
            },
        }),
    ],
})
