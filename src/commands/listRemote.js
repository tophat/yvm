const request = require('request')

const listRemoteCommand = () => {
    console.log('list-remote')
    const options = {
        url: 'https://api.github.com/repos/yarnpkg/yarn/tags',
        headers: {
            'User-Agent': 'YVM',
        },
    }

    request.get(options, (error, response, body) => {
        if (error) {
            console.log(error)
            process.exit(1)
        }

        const tags = JSON.parse(body)
        console.log(tags)
    })
}

module.exports = listRemoteCommand
