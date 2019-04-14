import fs from 'fs-extra'
import * as openpgp from 'openpgp'

import { yvmPath as rootPath } from '../../src/util/path'
import { verifySignature, VerificationError } from '../../src/util/verification'

import { resolveStable } from '../../src/util/alias'
import * as version from '../../src/util/version'

jest.mock('../../src/util/path', () => ({
    yvmPath: '/tmp/yvmInstall',
    getPathEntries: () => [],
}))

describe('verification', () => {
    beforeAll(() => {
        fs.mkdirsSync(rootPath)
    })

    it('executes successfully on valid signature', async () => {
        const mockVersion = await version.resolveVersion({
            versionString: await resolveStable(),
            yvmPath: rootPath,
        })
        expect.assertions(1)
        return expect(verifySignature(mockVersion, rootPath)).resolves.toEqual(
            true,
        )
    })

    it('throws verification error on invalid signature', async () => {
        //jest.spyOn(openpgp, '')
        const mockVersion = await version.resolveVersion({
            versionString: await resolveStable(),
            yvmPath: rootPath,
        })
        expect.assertions(1)
        return expect(verifySignature(mockVersion, rootPath)).rejects.toThrow(
            VerificationError,
        )
    })
})
