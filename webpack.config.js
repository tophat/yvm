const path = require('path')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const GithubReleasePlugin = require('./scripts/githubReleasePlugin')
const ZipPlugin = require('zip-webpack-plugin')

const outputPath = path.resolve(__dirname, 'artifacts', 'webpack_build')
const zipfileName = 'yvm.zip'

const now = new Date().toISOString()
const releaseName = `test-release_name-${now}`
const releaseOptions = {
    auth: { token: process.env.GITHUB_TOKEN },
    owner: 'tophatmonocle',
    repo: 'yvm',
    target_commitish: 'master',
    name: releaseName,
    body: '* test\n',
    draft: false,
    prerelease: false,
    assets: [zipfileName],
}

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'yvm.js',
        path: outputPath,
    },
    target: 'node',
    plugins: [
        new CopyWebpackPlugin(['src/yvm.sh']),
        new ZipPlugin({
            filename: zipfileName,
        }),
        new GithubReleasePlugin(releaseOptions),
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
