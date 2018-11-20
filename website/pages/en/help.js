/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react')

function docUrl(doc, language) {
    return `docs/${language ? `${language}/` : ''}${doc}`
}

class Help extends React.Component {
    render() {
        const language = this.props.language || ''
        const url = docUrl('readme.html', language)
        const supportLinks = [
            {
                content: `Learn more using the [documentation on this site.](${url})`,
                title: 'Browse Docs',
            },
            {
                content: 'Ask questions about the documentation and project',
                title: 'Join the community',
            },
            {
                content: "Find out what's new with this project",
                title: 'Stay up to date',
            },
        ]

        return (
            <div className="docMainWrapper wrapper">
                <div className="mainContainer documentContainer postContainer">
                    <div className="post">
                        <header className="postHeader">
                            <h1>Need help?</h1>
                        </header>
                        <p>
                            This project is maintained by a dedicated group of
                            people.
                        </p>
                        <div
                            contents={supportLinks}
                            layout="threeColumn"
                        />
                    </div>
                </div>
            </div>
        )
    }
}

module.exports = Help
