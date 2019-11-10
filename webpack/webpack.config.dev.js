const { execSync } = require('child_process')

const { WebpackCompilerPlugin } = require('webpack-compiler-plugin')

const { config } = require('./webpack.config.base')

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

const yvmDir = '${YVM_DIR}'
const yvmBinFile = `${yvmDir}/yvm.js`
const yvmBinFileBak = `${yvmBinFile}.bak`
const clearYvmCommands = [
    `rm "${yvmDir}/yvm.sh"`,
    `rm "${yvmDir}/yvm.fish"`,
    `rm -rf "${yvmDir}/shim"`,
]
const configureYvmCmd = linkCommands(
    fileExists(yvmBinFile),
    `node ${yvmBinFile} configure-shell --yvmDir "${yvmDir}"`,
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
