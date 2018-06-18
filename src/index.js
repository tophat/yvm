const argParser = require('commander')

module.exports = function(args) {
    argParser.command('install <version>').action(version => {
        console.log(`Installing yarn v${version}`)
        const install = require('./commands/install')
        install(version)
    })

    argParser.command('remove <version>').action(version => {
        console.log(`Removing yarn v${version}`)
    })

    argParser.command('manage <version>').action(version => {
        console.log(`Managing yarn v${version}`)
    })

    argParser.parse(args)
}
