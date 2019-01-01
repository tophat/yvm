const defaultOptions = {
    text: '',
}

const input = (options = {}) => {
    const { text } = { ...defaultOptions, ...options }
    process.stdin.resume()
    process.stdout.write(text)
    return new Promise(resolve => {
        process.stdin.once('data', data => {
            process.stdin.pause()
            resolve(data.toString().trim())
        })
    })
}

module.exports = input
