const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'yvm.js',
    },
    target: 'node',
    plugins: [new CopyWebpackPlugin(['yvm.sh'])],
}
