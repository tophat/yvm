const siteConfig = {
    title: 'YVM',
    tagline: 'Yarn Version Manager',
    // For deploy
    cname: 'yvm.js.org',
    url: 'https://yvm.js.org',
    baseUrl: '/',
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
    customDocsPath: 'website/docs',
    gaTrackingId: '',

    /* Custom fonts for website */
    /*
  fonts: {
    myFont: [
      "Times New Roman",
      "Serif"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  },
  */
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

    // Show documentation's last update time.
    // enableUpdateTime: true,

    // You may provide arbitrary config keys to be used as needed by your
    // template. For example, if you need your repo's URL...
    //   repoUrl: 'https://github.com/facebook/test-site',
}

module.exports = siteConfig
