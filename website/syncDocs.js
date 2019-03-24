#!/usr/bin/env node
/**
 * Sync content in repo README.md to separate documentation
 **/

const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')
const tags = {
    END: 'END',
    START: 'START',
    PLACEHOLDER: 'PLACEHOLDER',
}

const findSectionTag = (tagName, tagSuffix, document) => {
    const regex = new RegExp(`<!--\\s*${tagName}:${tagSuffix}\\s*-->`)
    const match = document.match(regex)
    return match
}

const findSection = (tagName, document) => {
    const startMatch = findSectionTag(tagName, tags.START, document)
    const endMatch = findSectionTag(tagName, tags.END, document)
    if (!startMatch || !endMatch) {
        return null
    }
    const startIndex = startMatch.index
    const endIndex = endMatch.index + endMatch[0].length
    return document.substring(startIndex, endIndex)
}

const replaceSection = (tagName, targetDocument, replacement) => {
    const [placeholder] = findSectionTag(
        tagName,
        tags.PLACEHOLDER,
        targetDocument,
    )
    return targetDocument.replace(placeholder, replacement)
}

const syncDoc = (tagName, sourceFile, targetFile) => {
    const sourceFileContent = fs.readFileSync(sourceFile, 'utf8')
    const targetFileContent = fs.readFileSync(targetFile, 'utf8')
    const section = findSection(tagName, sourceFileContent)
    const updated = replaceSection(tagName, targetFileContent, section)
    fs.writeFileSync(targetFile, updated)
}

const syncDefinitions = [
    { tag: 'BADGES', source: 'README.md', target: 'docs/overview.md' },
    { tag: 'OVERVIEW-DOCS', source: 'README.md', target: 'docs/overview.md' },
    { tag: 'CONTRIBUTING-DOCS', source: 'README.md', target: 'docs/contribute.md' },
]
syncDefinitions.forEach(({ tag, source, target }) => {
    syncDoc(tag, path.resolve(rootDir, source), path.resolve(rootDir, target))
})
