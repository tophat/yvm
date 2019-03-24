#!/usr/bin/env node
/**
 * Sync content in repo README.md to separate documentation
 **/
const path = require('path')
const { syncDefinitions, syncDoc } = require('./lib/synchronizeDocs')

const rootDir = path.resolve(__dirname, '..')
syncDefinitions.forEach(({ tag, source, target }) => {
    syncDoc(tag, path.resolve(rootDir, source), path.resolve(rootDir, target))
})
