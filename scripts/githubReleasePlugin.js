const ghRelease = require('gh-release')

module.exports = class GithubReleasePlugin {
    constructor(options) {
        this.options = options
    }

    apply(compiler) {
        compiler.hooks.done.tapAsync(
            'GithubReleasePlugin',
            (stats, callback) => {
                const { assets, ...rest } = this.options
                const assetsToUpload = assets.reduce((acc, assetName) => {
                    const asset = stats.compilation.assets[assetName]
                    if (!asset) {
                        // eslint-disable-next-line no-console
                        console.warn(
                            `${assetName} was not found in the final webpack assets`,
                        )
                        return acc
                    }
                    return [...acc, asset.existsAt]
                }, [])
                const options = {
                    ...rest,
                    assets: assetsToUpload,
                    workpath: '',
                }

                ghRelease(options, (err, result) => {
                    if (err) {
                        console.error(err) // eslint-disable-line no-console
                        throw err
                    }
                    console.log(result) // eslint-disable-line no-console
                    callback()
                })
            },
        )
    }
}
