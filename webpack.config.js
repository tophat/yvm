const path = require('path')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'yvm.js',
        path: path.resolve(__dirname, 'artifacts', 'webpack_build'),
    },
    target: 'node',
    plugins: [
        new CopyWebpackPlugin(['src/yvm.sh']),
        new ZipPlugin({
            filename: 'yvm.zip',
        }),
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
}
