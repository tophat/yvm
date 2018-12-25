const os = require('os')
const path = require('path')

const yvmPath = process.env.YVM_DIR || path.resolve(os.homedir(), '.yvm')
module.exports = { yvmPath }
