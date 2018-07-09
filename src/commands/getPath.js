const path = require('path')

const { versionRootPath, yvmPath } = require('../common/utils')

const getPath = (version, rootPath = yvmPath) => {
    const splitPath = process.env.PATH.split(path.delimiter)
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

module.exports = getPath
