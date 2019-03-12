const fs = require('fs')
const request = require('request')

const { USER_AGENT } = require('./constants')

const isErrorCode = httpStatusCode => httpStatusCode >= 400

const downloadFile = (url, filePath) =>
    new Promise((resolve, reject) => {
        const handleError = err => reject(err)
        request
            .get(url, { headers: { 'user-agent': USER_AGENT } })
            .on('error', handleError)
            .on('response', r => {
                const msg = `HTTP ${r.statusCode} - ${r.statusMessage} (${url})`
                if (isErrorCode(r.statusCode)) handleError(msg)
            })
            .pipe(fs.createWriteStream(filePath))
            .on('finish', () => resolve())
    })

module.exports = {
    downloadFile,
}
