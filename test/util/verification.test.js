import { vol } from 'memfs'
import kbpgp from 'kbpgp'

import { downloadFile, getDownloadPath } from 'util/download'
import { yvmPath as rootPath } from 'util/path'
import { getVersionDownloadUrl } from 'util/utils'
import {
    PublicKeyImportError,
    VerificationError,
    verifySignature,
} from 'util/verification'

jest.mock('util/path', () => ({
    yvmPath: '/tmp/util/verification/yvm',
    getPathEntries: () => [],
}))

describe('verification', () => {
    const mockVersion = '1.15.2'
    const importKeySpy = jest.spyOn(kbpgp.KeyManager, 'import_from_armored_pgp')
    const unboxSpy = jest.spyOn(kbpgp, 'unbox')
    const downloadMockFile = downloadFile(
        getVersionDownloadUrl(mockVersion),
        getDownloadPath(mockVersion, rootPath),
    )
    beforeEach(() => {
        vol.fromJSON({ [rootPath]: {} })
        jest.clearAllMocks()
    })
    afterEach(() => vol.reset())
    afterAll(jest.restoreAllMocks)

    it('executes successfully on valid signature', async () => {
        expect.assertions(1)
        await downloadMockFile
        const verification = verifySignature(mockVersion, rootPath)
        await expect(verification).resolves.toEqual(true)
    })

    it('throws public key error on import fail', async () => {
        expect.assertions(2)
        await downloadMockFile
        importKeySpy.mockImplementationOnce((_, cb) => cb('mock-error'))
        const verification = verifySignature(mockVersion, rootPath)
        await expect(verification).rejects.toThrow(PublicKeyImportError)
        expect(importKeySpy).toHaveBeenCalledTimes(1)
    })

    it('throws verification error on invalid signature', async () => {
        expect.assertions(2)
        await downloadMockFile
        unboxSpy.mockImplementationOnce((_, cb) => cb('mock-error'))
        const verification = verifySignature(mockVersion, rootPath)
        await expect(verification).rejects.toThrow(VerificationError)
        expect(unboxSpy).toHaveBeenCalledTimes(1)
    })
})
