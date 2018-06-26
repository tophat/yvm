const CopyPlugin = require('copy-webpack-plugin')
const path = require('path')

const outputPath = path.resolve(__dirname, '..', 'artifacts', 'webpack_build')

module.exports = {
    mode: 'production',
    entry: './src/yvm.js',
    output: {
        filename: 'yvm.js',
        path: outputPath,
    },
    target: 'node',
    plugins: [new CopyPlugin(['src/yvm.sh'])],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
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
