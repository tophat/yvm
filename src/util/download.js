import fs from 'fs'
import request from 'request'
import path from 'path'

import { USER_AGENT } from 'util/constants'

const isErrorCode = httpStatusCode => httpStatusCode >= 400

export const downloadFile = (url, filePath) =>
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

export const getDownloadPath = (version, rootPath) =>
    path.resolve(rootPath, 'versions', `yarn-v${version}.tar.gz`)
