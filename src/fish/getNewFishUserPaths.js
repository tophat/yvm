const { versionRootPath, yvmPath } = require('../util/utils')

const FISH_ARRAY_DELIMINATOR = ' '

const getNewFishUserPaths = (
    version,
    rootPath = yvmPath,
    pathString = process.env.FISH_USER_PATHS || '',
) => {
    const splitPath = pathString.split(FISH_ARRAY_DELIMINATOR)
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

    return splitPath.join(FISH_ARRAY_DELIMINATOR).trim()
}

module.exports = getNewFishUserPaths
