// @ts-check
// Hub landing page for www.zcohen-nerd.com.
// Chrome (Navbar + Footer) comes from the @zcohen-nerd/brand theme, so the
// themeConfig navbar/footer here are intentionally minimal — the swizzled
// components ignore them.

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'zcohen-nerd — Engineering, Systems Thinking, and Modern Literacy',
  tagline:
    'Practical engineering, systems thinking, and modern literacy — documented in public.',
  favicon: 'img/zcohen-nerd-icon.png',

  url: 'https://www.zcohen-nerd.com',
  // Served at the root domain. Other projects route off subpaths
  // (/portfolio, /literacy, /connectors) via reverse-proxy rewrites.
  baseUrl: '/',

  organizationName: 'zcohen-nerd',
  projectName: 'zcohen-nerd-landing-page',

  // /portfolio, /literacy, /connectors are served by sibling repos via
  // reverse-proxy rewrites — they don't resolve in this standalone build.
  onBrokenLinks: 'warn',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Shared brand: swizzled Navbar + Footer for the whole ecosystem.
  themes: ['@zcohen-nerd/brand'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        // Pure custom homepage — no docs, no blog.
        docs: false,
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/zcohen-nerd-icon.png',
      colorMode: {
        // The parent zcohen-nerd theme is a light command-deck. No dark variant.
        defaultMode: 'light',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      // Navbar/Footer are fully provided by @zcohen-nerd/brand; these stay empty.
      navbar: {items: []},
      footer: {style: 'dark', links: []},
    }),
};

module.exports = config;
