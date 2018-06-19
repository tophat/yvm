/* eslint-disable global-require,prettier/prettier */
const argParser = require('commander')

module.exports = function dispatch(args) {
    argParser
        .command('install <version>')
        .action(version => {
            console.log(`Installing yarn v${version}`)
            const install = require('./commands/install')
            install(version)
        })

    argParser
        .command('remove <version>')
        .action(version => {
            console.log(`Removing yarn v${version}`)
        })

    argParser
        .command('exec <version>')
        .action((version) => {
            console.log(`Executing yarn command with version ${version}`)
            const exec = require('./commands/exec')
            const extraArgs = args.slice(4)  //returns args without [npm, start, exec, <version>, <command>]
            exec(version, extraArgs)
        })

    argParser.parse(args)
}
