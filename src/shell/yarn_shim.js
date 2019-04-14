#!/usr/bin/env node
const [bin, file, ...args] = process.argv
process.argv = [bin, file, 'exec', ...args]
require('../yvm')
