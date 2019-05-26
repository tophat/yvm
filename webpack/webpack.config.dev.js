const { config } = require('./webpack.config.base')
const ShellPlugin = require('./plugins/shell-plugin')

const joinCommands = (...cmds) => cmds.join(' && ')
const fileExists = filePath => `[ -f "${filePath}" ]`

const yvmBinFile = '${HOME}/.yvm/yvm.js'
const yvmBinFileBak = `${yvmBinFile}.bak`
const clearYvmCommands = [
    'rm "${HOME}/.yvm/yvm.sh"',
    'rm "${HOME}/.yvm/yvm.fish"',
    'rm -rf "${HOME}/.yvm/shim"',
]
const configureYvmCmd = joinCommands(
    fileExists(yvmBinFile),
    `node ${yvmBinFile} configure-shell`,
)
const installYVMPlugin = new ShellPlugin({
    onBuildEnter: joinCommands(
        fileExists(yvmBinFile),
        `mv -n "${yvmBinFile}" "${yvmBinFileBak}"`,
    ),
    onBuildEnd: [
        ...clearYvmCommands,
        `cp "./artifacts/webpack_build/yvm.js" "${yvmBinFile}"`,
        configureYvmCmd,
    ],
    onBuildExit: [
        ...clearYvmCommands,
        joinCommands(
            fileExists(yvmBinFileBak),
            `mv "${yvmBinFile}.bak" "${yvmBinFile}"`,
        ),
        configureYvmCmd,
    ],
})

module.exports = env =>
    Object.assign(config, {
        mode: 'development',
        plugins: [
            ...config.plugins,
            env.INSTALL === 'true' && installYVMPlugin,
        ].filter(Boolean),
    })
