import fs from 'fs-extra'
import * as openpgp from 'openpgp'

import { downloadFile, getDownloadPath } from 'util/download'
import { yvmPath as rootPath } from 'util/path'
import { getVersionDownloadUrl } from 'util/utils'
import { verifySignature, VerificationError } from 'util/verification'

jest.mock('util/path', () => ({
    yvmPath: '/tmp/util/verification/yvm',
    getPathEntries: () => [],
}))

describe('verification', () => {
    const mockVersion = '1.15.2'
    const mockVerify = jest.spyOn(openpgp, 'verify', 'get')
    const downloadMockFile = downloadFile(
        getVersionDownloadUrl(mockVersion),
        getDownloadPath(mockVersion, rootPath),
    )
    beforeAll(() => {
        fs.mkdirsSync(rootPath)
    })
    beforeEach(jest.clearAllMocks)
    afterAll(jest.restoreAllMocks)

    it('executes successfully on valid signature', async () => {
        expect.assertions(1)
        await downloadMockFile
        const verification = verifySignature(mockVersion, rootPath)
        await expect(verification).resolves.toEqual(true)
    })

    it('throws verification error on invalid signature', async () => {
        expect.assertions(1)
        await downloadMockFile
        mockVerify.mockImplementationOnce(() => () =>
            Promise.resolve({ signatures: [] }),
        )
        const verification = verifySignature(mockVersion, rootPath)
        await expect(verification).rejects.toThrow(VerificationError)
    })
})
