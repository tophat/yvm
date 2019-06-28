const { execSync } = require('child_process')
const { config } = require('./webpack.config.base')
const { WebpackCompilerPlugin } = require('webpack-compiler-plugin')

const log = console.log.bind(console) // eslint-disable-line no-console
const linkCommands = (...cmds) => cmds.join(' && ')
const fileExists = filePath => `[ -f "${filePath}" ]`
const handleScript = script => {
    try {
        return execSync(script, { stdio: 'inherit' })
    } catch (e) {
        log(e.message)
    }
}
const executeScripts = scripts => scripts.forEach(handleScript)
const scriptExecutor = scripts => () => executeScripts(scripts)

const yvmBinFile = '${HOME}/.yvm/yvm.js'
const yvmBinFileBak = `${yvmBinFile}.bak`
const clearYvmCommands = [
    'rm "${HOME}/.yvm/yvm.sh"',
    'rm "${HOME}/.yvm/yvm.fish"',
    'rm -rf "${HOME}/.yvm/shim"',
]
const configureYvmCmd = linkCommands(
    fileExists(yvmBinFile),
    `node ${yvmBinFile} configure-shell`,
)
const installYVMPlugin = new WebpackCompilerPlugin({
    name: 'install-yvm-plugin',
    listeners: {
        buildStart: scriptExecutor([
            linkCommands(
                fileExists(yvmBinFile),
                `mv -n "${yvmBinFile}" "${yvmBinFileBak}"`,
            ),
        ]),
        compileEnd: scriptExecutor([
            ...clearYvmCommands,
            `cp "./artifacts/webpack_build/yvm.js" "${yvmBinFile}"`,
            configureYvmCmd,
        ]),
        buildEnd: scriptExecutor([
            ...clearYvmCommands,
            linkCommands(
                fileExists(yvmBinFileBak),
                `mv "${yvmBinFileBak}" "${yvmBinFile}"`,
            ),
            configureYvmCmd,
        ]),
    },
})

module.exports = env =>
    Object.assign(config, {
        mode: 'development',
        plugins: [
            ...config.plugins,
            env && env.INSTALL === 'true' && installYVMPlugin,
        ].filter(Boolean),
    })
