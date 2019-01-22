module.exports = {
    'plugins': [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        ["@semantic-release/github", {
            "assets": [
                {"path": "/artifacts/yvm.zip", "label": "yvm.zip"}
            ]
        }]
    ]
}
