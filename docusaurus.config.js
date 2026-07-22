// @ts-check
// Hub landing page for zcohen-nerd.com.
// Chrome (Navbar + Footer) comes from the @zcohen-nerd/brand theme, so the
// themeConfig navbar/footer here are intentionally minimal — the swizzled
// components ignore them.

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'zcohen-nerd — Engineering, Systems Thinking, and Modern Literacy',
  tagline:
    'Practical engineering, systems thinking, and modern literacy — documented in public.',
  favicon: 'img/zcohen-nerd-icon.png',

  // Canonical apex domain; www.zcohen-nerd.com 301-redirects here.
  url: 'https://zcohen-nerd.com',
  baseUrl: '/',
  // GitHub Pages serves directory-style URLs (/about/); make that explicit
  // so the sitemap and internal links use the final, non-redirecting form.
  trailingSlash: true,

  organizationName: 'zcohen-nerd',
  projectName: 'zcohen-nerd-landing-page',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  // Structured data: WebSite + Person identity for the whole ecosystem.
  headTags: [
    {
      tagName: 'script',
      attributes: {type: 'application/ld+json'},
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'zcohen-nerd',
        url: 'https://zcohen-nerd.com/',
        description:
          'Practical engineering, systems thinking, and modern literacy — documented in public.',
      }),
    },
    {
      tagName: 'script',
      attributes: {type: 'application/ld+json'},
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Zac Cohen',
        alternateName: 'Zachary Cohen',
        url: 'https://zcohen-nerd.com/',
        jobTitle: 'Electromechanical Systems Engineer',
        sameAs: [
          'https://github.com/zcohen-nerd',
          'https://www.linkedin.com/in/zachary-cohen-nerd/',
          'https://zcohennerd.substack.com/',
          'https://portfolio.zcohen-nerd.com/',
        ],
      }),
    },
  ],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Privacy-friendly analytics (Plausible): cookieless, no personal data.
  // The outbound-links variant also records an "Outbound Link: Click" event
  // (with the destination URL as a prop) for every click that leaves the
  // site — covering project cards, nav, and footer links without any
  // per-link markup. Requires the zcohen-nerd.com site to be registered in
  // the Plausible account; no secrets live in this repo.
  scripts: [
    {
      src: 'https://plausible.io/js/script.outbound-links.js',
      defer: true,
      'data-domain': 'zcohen-nerd.com',
    },
  ],

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
      image: 'img/og-zcohen-nerd.png',
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
