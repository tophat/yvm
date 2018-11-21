const siteConfig = {
    title: 'YVM',
    tagline: 'Yarn Version Manager',
    // For deploy
    // cname: 'yvm.js.org', TEMP DISABLED
    url: 'https://tophat.github.io',
    baseUrl: '/yvm/',
    projectName: 'yvm',
    organizationName: 'tophat',
    // End deploy options
    headerLinks: [
        { doc: 'readme', label: 'Docs' },
        { doc: 'doc4', label: 'API' },
        { page: 'help', label: 'Help' },
    ],
    headerIcon: 'img/docusaurus.svg',
    footerIcon: 'img/docusaurus.svg',
    favicon: 'img/favicon.png',
    colors: {
        primaryColor: '#2E8555',
        secondaryColor: '#205C3B',
    },
    customDocsPath: 'docs',
    gaTrackingId: '',

    copyright: `Copyright © ${new Date().getFullYear()} Tophatmonocle Corp.`,

    highlight: {
        // Highlight.js theme to use for syntax highlighting in code blocks.
        theme: 'default',
    },

    // Add custom scripts here that would be placed in <script> tags.
    scripts: ['https://buttons.github.io/buttons.js'],
    onPageNav: 'separate', // On page navigation for the current documentation page.
    cleanUrl: true, // No .html extensions for paths.

    // Open Graph and Twitter card images.
    ogImage: 'img/docusaurus.png',
    twitterImage: 'img/docusaurus.png',

    // Show documentation's last contributor's name.
    enableUpdateBy: true,
}

module.exports = siteConfig
