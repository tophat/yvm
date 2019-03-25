const fs = require('fs')

const {
    findSection,
    findSectionTag,
    replaceSection,
    syncDefinitions,
    syncDoc,
    tags,
} = require('../lib/synchronizeDocs')

describe('synchronizeDocs', () => {
    describe('findSectionTag', () => {
        it('finds section', () => {
            const successCases = [
                'something <!--    TAGNAME:SUFFIX--> something else',
                'something <!-- TAGNAME:SUFFIX --> something else',
                'something\n<!--TAGNAME:SUFFIX-->\nsomething else',
            ]
            successCases.forEach(document => {
                const result = findSectionTag('TAGNAME', 'SUFFIX', document)
                expect(result).toBeTruthy()
                expect(result[0]).toEqual(
                    expect.stringContaining('TAGNAME:SUFFIX'),
                )
            })
        })
        it('does not find section', () => {
            const failureCases = [
                'something no tag here something else',
                'something <!- TAGNAME:SUFFIX --> something else',
                'something\n<!--TAGNAME:SUFFIX\n.-->\nsomething else',
            ]
            failureCases.forEach(document => {
                const result = findSectionTag('TAGNAME', 'SUFFIX', document)
                expect(result).toBeNull()
            })
        })
    })

    describe('findSection', () => {
        it('returns start to end', () => {
            const document = `some document with start and end tags
<!-- TAGNAME:START -->this is the content here<!-- TAGNAME:END -->
<!-- OTHERTAG:START -->other things to be ignored<!-- OTHERTAG:END -->`

            expect(findSection('TAGNAME', document)).toEqual(
                '<!-- TAGNAME:START -->this is the content here<!-- TAGNAME:END -->',
            )
        })
        it('returns nothing if start not found', () => {
            const document = `some document with start and end tags
this is the content here<!-- TAGNAME:END -->
<!-- OTHERTAG:START -->other things to be ignored<!-- OTHERTAG:END -->`

            expect(findSection('TAGNAME', document)).toBeNull()
        })
        it('returns nothing if end not found', () => {
            const document = `some document with start and end tags
<!-- TAGNAME:START -->this is the content here
<!-- OTHERTAG:START -->other things to be ignored<!-- OTHERTAG:END -->`

            expect(findSection('TAGNAME', document)).toBeNull()
        })
    })

    describe('replaceSection', () => {
        it('replaces placeholder tag and returns updated document', () => {
            const document = `some document with start and end tags
<!-- TAGNAME:START -->this is something<!-- TAGNAME:END -->
<!-- OTHERTAG:PLACEHOLDER -->`

            expect(replaceSection('OTHERTAG', document, 'Replacement Content'))
                .toEqual(`some document with start and end tags
<!-- TAGNAME:START -->this is something<!-- TAGNAME:END -->
Replacement Content`)
        })
    })

    describe('syncDoc', () => {
        const sourceFile =
            '<!-- TAGNAME:START -->will replace target<!-- TAGNAME:END -->'
        beforeEach(() => {
            fs.writeFileSync('sourceFile', sourceFile)
            fs.writeFileSync('targetFile', '<!-- TAGNAME:PLACEHOLDER -->')
        })
        afterAll(() => {
            fs.unlinkSync('sourceFile')
            fs.unlinkSync('targetFile')
        })
        it('writes replaced target to fs', () => {
            syncDoc('TAGNAME', 'sourceFile', 'targetFile')
            expect(fs.readFileSync('targetFile', 'utf8')).toEqual(sourceFile)
        })
    })

    describe('defintions', () => {
        const cases = syncDefinitions.map(def => [def.tag, def])
        it.each(cases)(
            'has correct tags in source for %s',
            (_, { tag, source }) => {
                const sourceFileContent = fs.readFileSync(source, 'utf8')
                expect(findSection(tag, sourceFileContent)).toBeTruthy()
                expect(
                    findSectionTag(tag, tags.PLACEHOLDER, sourceFileContent),
                ).toBeNull()
            },
        )
        it.each(cases)(
            'has correct tags in target for %s',
            (_, { tag, target }) => {
                const targetFileContent = fs.readFileSync(target, 'utf8')
                expect(findSection(tag, targetFileContent)).toBeNull()
                expect(
                    findSectionTag(tag, tags.PLACEHOLDER, targetFileContent),
                ).toBeTruthy()
            },
        )
    })
})
