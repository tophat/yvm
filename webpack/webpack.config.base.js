const path = require('path')

const CopyPlugin = require('copy-webpack-plugin')
const nodeExternals = require('webpack-node-externals')

const rootPath = path.resolve(__dirname, '..')
const artifactsPath = path.resolve(rootPath, 'artifacts')
const outputPath = path.resolve(artifactsPath, 'webpack_build')

module.exports = {
    mode: 'production',
    entry: {
        yvm: ['@babel/polyfill', './src/yvm.js'],
    },
    externals: [nodeExternals()],
    output: {
        filename: '[name].js',
        path: outputPath,
    },
    target: 'node',
    plugins: [new CopyPlugin(['src/yvm.sh', 'src/yvm.fish'])],
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        plugins: ['dynamic-import-node'],
                        presets: [
                            ['@babel/preset-env', { targets: { node: '8.0' } }],
                        ],
                    },
                },
            },
        ],
    },
}
