const { execSync } = require('child_process')

const log = console.log.bind(console) // eslint-disable-line no-console

const pluginName = 'yvm-shell-plugin'
const defaultOptions = {
    onBuildEnter: [],
    onBuildStart: [],
    onBuildEnd: [],
    onBuildExit: [],
}

module.exports = class ShellPlugin {
    constructor(options) {
        this.options = this.validateInput({ ...defaultOptions, ...options })
    }

    handleScript(script) {
        try {
            return execSync(script, { stdio: 'inherit' })
        } catch (e) {
            log(e.message)
        }
    }

    executeScripts(scripts) {
        scripts.forEach(this.handleScript)
    }

    cleanup(scripts) {
        // attach callback to the process event emitter
        process.on('cleanup', () => {
            log('\nExecuting post-exit scripts')
            this.executeScripts(scripts)
        })

        // do app specific cleaning before exiting
        process.on('exit', () => {
            process.emit('cleanup')
        })

        // catch ctrl+c event and exit normally
        process.on('SIGINT', () => {
            log('\nCaught Exit...')
            process.exit(2)
        })

        // catch uncaught exceptions, trace, then exit normally
        process.on('uncaughtException', e => {
            log('\nUncaught Exception...')
            log(e.stack)
            process.exit(99)
        })
    }

    validateInput(options) {
        for (const p of [
            'onBuildEnter',
            'onBuildStart',
            'onBuildEnd',
            'onBuildExit',
        ]) {
            if (typeof options[p] === 'string') {
                options[p] = [options[p]]
            }
        }
        return options
    }

    apply(compiler) {
        compiler.hooks.afterPlugins.tap(pluginName, () => {
            log('\nExecuting pre-enter scripts')
            this.executeScripts(this.options.onBuildEnter)
        })

        compiler.hooks.compilation.tap(pluginName, () => {
            log('\nExecuting pre-build scripts')
            this.executeScripts(this.options.onBuildStart)
        })

        compiler.hooks.done.tap(pluginName, () => {
            log('\nExecuting post-build scripts')
            this.executeScripts(this.options.onBuildEnd)
        })

        this.cleanup(this.options.onBuildExit)
    }
}
