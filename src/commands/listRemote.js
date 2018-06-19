const request = require('request')

const { stripVersionPrefix } = require('../common/utils')

const listRemoteCommand = () => {
    console.log('list-remote')
    const options = {
        url: 'https://api.github.com/repos/yarnpkg/yarn/tags',
        headers: {
            'User-Agent': 'YVM',
        },
    }

    request.get(options, (error, response, body) => {
        if (error || response.statusCode !== 200) {
            console.log(
                'Unable to fetch available Yarn versions.',
                'Please check network connection.',
            )
            process.exit(1)
        }

        const tags = JSON.parse(body)
        const tagNames = tags.map(tag => tag.name)
        const versions = tagNames.map(stripVersionPrefix)

        console.log(versions)
    })
}

module.exports = listRemoteCommand
