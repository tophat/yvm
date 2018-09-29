const fs = require('fs')
const request = require('request')

const downloadFile = (url, filePath) => {
	const file = fs.createWriteStream(filePath)

    return new Promise((resolve, reject) => {
        const stream = request.get(url).pipe(file)
        stream.on('finish', () => resolve())
        stream.on('error', err => {
            reject(new Error(err))
        })
    })
}

module.exports = {
	downloadFile,
}