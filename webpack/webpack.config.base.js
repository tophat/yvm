const path = require('path')

const CopyPlugin = require('copy-webpack-plugin')
const nodeExternals = require('webpack-node-externals')

const outputPath = path.resolve(__dirname, '..', 'artifacts', 'webpack_build')

module.exports = {
    mode: 'production',
    entry: {
        yvm: ['@babel/polyfill', './src/yvm.js'],
        'yvm-exec': ['@babel/polyfill', './src/yvm-exec.js'],
    },
    externals: [nodeExternals()],
    output: {
        filename: '[name].js',
        path: outputPath,
    },
    target: 'node',
    plugins: [new CopyPlugin(['src/yvm.sh'])],
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        presets: [
                            ['@babel/preset-env', { targets: { node: '4.8' } }],
                        ],
                    },
                },
            },
        ],
    },
}
