const path = require('path')

const { versionRootPath } = require('../util/utils')
const { getCurrentPath, getPathDelimiter, yvmPath } = require('../util/path')

const getNewPath = ({ version, rootPath = yvmPath, shell, pathString }) => {
    const pathDelimiter = getPathDelimiter(shell)
    const pathToUpdate = pathString || getCurrentPath(shell) || ''
    const splitPath = pathToUpdate.split(pathDelimiter)
    const destPath = versionRootPath(rootPath)

    const newPathSegment = path.resolve(destPath, `v${version}`, 'bin')
    let hadExistingPath = false

    for (let i = 0; i < splitPath.length; i += 1) {
        const pathSegment = splitPath[i]
        if (pathSegment.startsWith(destPath)) {
            splitPath[i] = newPathSegment
            hadExistingPath = true
            break
        }
    }

    if (!hadExistingPath) {
        splitPath.unshift(newPathSegment)
    }

    return splitPath.join(pathDelimiter).trim()
}

module.exports = getNewPath
