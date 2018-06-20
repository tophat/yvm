const { versionRootPath } = require('../common/utils')

const whichCommand = () => {
    const pathVariables = process.env.PATH.split(':')
    pathVariables.forEach(element => {
        if (element.startsWith(versionRootPath)) {
            const elementParts = element.split('/')
            const version = elementParts[elementParts.length - 2]
            console.log(`Found ${element} in PATH with version ${version}`)
        }
    })
}

module.exports = whichCommand
