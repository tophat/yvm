const USER_AGENT = 'YVM'

const YARN_DOWNLOAD_URL = 'https://yarnpkg.com/downloads'
const YARN_INSTALL_PAGE_URL = 'https://yarnpkg.com/lang/en/docs/install/'
const YARN_INSTALL_STABLE_REGEX = /stable \(([\w.-]+)\)/i
const YARN_RELEASE_TAGS_URL = 'https://github.com/yarnpkg/yarn/releases/tag'
const YARN_RELEASES_API_URL =
    'https://d236jo9e8rrdox.cloudfront.net/yarn-releases'
const YARN_PUBLIC_KEY_URL = 'https://dl.yarnpkg.com/debian/pubkey.gpg'

module.exports = {
    USER_AGENT,
    YARN_DOWNLOAD_URL,
    YARN_INSTALL_PAGE_URL,
    YARN_INSTALL_STABLE_REGEX,
    YARN_PUBLIC_KEY_URL,
    YARN_RELEASE_TAGS_URL,
    YARN_RELEASES_API_URL,
}
