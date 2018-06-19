const { getExtractionPath } = require('./utils')

describe(`utils`, () => {
    it(`getExtractionPath`, () => {
        const path = getExtractionPath()
        expect(path).toMatchSnapshot()
    })
})
