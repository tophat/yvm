const siteConfig = {
    title: 'Yarn Version Manager',
    tagline: 'Yarn Version Manager',
    // For deploy
    cname: 'yvm.js.org',
    url: 'https://tophat.github.io',
    baseUrl: '/yvm/',
    projectName: 'yvm',
    organizationName: 'tophat',
    // End deploy options
    headerLinks: [
        { doc: 'readme', label: 'Docs' },
        { href: "https://github.com/tophat/yvm", label: "GitHub" },
    ],
    headerIcon: 'img/yarn.png',
    footerIcon: 'img/yarn.png',
    favicon: 'img/favicon.png',
    colors: {
        primaryColor: '#f9316d',
        secondaryColor: '#f9316d',
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
    ogImage: 'img/yarn.png',
    twitterImage: 'img/yarn.png',

    // Show documentation's last contributor's name.
    enableUpdateBy: true,

    // Show documentation's last update time.
    // enableUpdateTime: true,

    // You may provide arbitrary config keys to be used as needed by your
    // template. For example, if you need your repo's URL...
    //   repoUrl: 'https://github.com/facebook/test-site',
}

module.exports = siteConfig
