import zlib from 'zlib'
import fs from 'fs'

import tar from 'tar-fs'

export const extract = async ({ src, dest }) =>
    await new Promise((resolve, reject) => {
        fs.createReadStream(src)
            .on('error', reject)
            .pipe(
                zlib
                    .createGunzip({})
                    .on('error', () =>
                        reject(new Error('Unable to decompress.')),
                    ),
            )
            .pipe(
                tar
                    .extract(dest, {})
                    .on('error', () => reject(new Error('Unable to extract.')))
                    .on('finish', () => resolve(dest)),
            )
    })
