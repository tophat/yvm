const siteConfig = {
    title: 'Yarn Version Manager',
    tagline: 'Yarn Version Manager',
    // For deploy
    cname: 'yvm.js.org',
    url: 'https://yvm.js.org',
    baseUrl: '/',
    projectName: 'yvm',
    organizationName: 'tophat',
    // End deploy options
    headerLinks: [
        { doc: 'overview', label: 'Docs' },
        { href: "https://github.com/tophat/yvm", label: "GitHub" },
    ],
    headerIcon: 'img/yarn.png',
    footerIcon: 'img/yarn.png',
    favicon: 'img/favicon.png',
    colors: {
        primaryColor: '#f9316d',
        secondaryColor: '#f9316d',
    },
    customDocsPath: 'docs',
    gaTrackingId: 'UA-129741728-1',

    copyright: 'Top Hat Open Source',

    highlight: {
        // Highlight.js theme to use for syntax highlighting in code blocks.
        theme: 'default',
    },

    // Add custom scripts here that would be placed in <script> tags.
    scripts: ['https://buttons.github.io/buttons.js'],
    onPageNav: 'separate', // On page navigation for the current documentation page.
    cleanUrl: true, // No .html extensions for paths.

    // Open Graph and Twitter card images.
    ogImage: 'img/yarn.png',
    twitterImage: 'img/yarn.png',

    // Show documentation's last contributor's name.
    enableUpdateBy: true,
}

module.exports = siteConfig
