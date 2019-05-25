const { config } = require('./webpack.config.base')
const ShellPlugin = require('./plugins/shell-plugin')

const clearYvmCommands = [
    'rm "${HOME}/.yvm/yvm.sh"',
    'rm "${HOME}/.yvm/yvm.fish"',
    'rm -rf "${HOME}/.yvm/shim"',
]
const configureYvmCmd = 'node "${HOME}/.yvm/yvm.js" configure-shell'
const installYVMPlugin = new ShellPlugin({
    onBuildEnter: ['mv -n "${HOME}/.yvm/yvm.js" "${HOME}/.yvm/yvm.js.bak"'],
    onBuildEnd: [
        ...clearYvmCommands,
        'mv "./artifacts/webpack_build/yvm.js" "${HOME}/.yvm/yvm.js"',
        configureYvmCmd,
    ],
    onBuildExit: [
        ...clearYvmCommands,
        'mv "${HOME}/.yvm/yvm.js.bak" "${HOME}/.yvm/yvm.js"',
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
