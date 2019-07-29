module.exports = {
    'plugins': [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        ["@semantic-release/github", {
            "assets": [
                {"path": "artifacts/yvm.zip", "name": "yvm.zip"},
                {"path": "artifacts/webpack_build/yvm.js", "name": "yvm.js"},
            ]
        }]
    ]
}
