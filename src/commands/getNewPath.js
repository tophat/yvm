const path = require('path')

const { versionRootPath } = require('../util/utils')
const { yvmPath } = require('../util/path')

const getNewPath = (
    version,
    rootPath = yvmPath,
    pathString = process.env.PATH,
) => {
    const splitPath = pathString.split(path.delimiter)
    const destPath = versionRootPath(rootPath)

    const newPathSegment = `${destPath}/v${version}/bin`
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

    return splitPath.join(path.delimiter)
}

module.exports = getNewPath
