const CopyPlugin = require('copy-webpack-plugin')
const path = require('path')

const outputPath = path.resolve(__dirname, '..', 'artifacts', 'webpack_build')

module.exports = {
    mode: 'production',
    entry: {
        yvm: './src/yvm.js',
        'yvm-exec': './src/yvm-exec.js',
    },
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
