const fs = require('fs-extra')
const {
    versionRootPath,
} = require('../src/common/utils')

beforeAll(()=>{
    fs.removeSync(versionRootPath)
})

afterEach(()=>{
    fs.removeSync(versionRootPath)
})
