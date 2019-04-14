module.exports = {
    'plugins': [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        ["@semantic-release/github", {
            "assets": [
                {"path": "artifacts/yvm.zip", "name": "yvm.zip"},
                {"path": "artifacts/yvm.js", "name": "yvm.js"}
            ]
        }]
    ]
}
