const argParser = require('commander')

console.log('called yvm.js with args', process.argv)

argParser
    .command('install <version>')
    .action(version => {
        console.log(`Installing yarn v${version}`)
    })

argParser
    .command('remove <version>')
    .action(version => {
        console.log(`Removing yarn v${version}`)
    })

argParser
    .command('manage <version>')
    .action(version => {
        console.log(`Managing yarn v${version}`)
    })

argParser.parse(process.argv)
