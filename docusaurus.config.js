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
  onBrokenAnchors: 'throw',
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
        image: 'https://zcohen-nerd.com/img/zachary-cohen-headshot.jpg',
        jobTitle: 'Electromechanical Systems Engineer',
        // Matches the About page: a one-line summary, no employer / location.
        description:
          'Systems-minded electromechanical engineer, maker, and educator — builder of practical engineering tools, technical guides, and open educational resources.',
        // Only topics that appear on the sites' own pages. No invented terms.
        knowsAbout: [
          'Electromechanical systems integration',
          'Autonomous maritime systems',
          'Embedded hardware bring-up',
          'Hardware safety architecture',
          'PCB design',
          'Connector and interface engineering',
          'Fusion 360',
          'Engineering documentation',
          'Engineering education',
        ],
        sameAs: [
          'https://github.com/zcohen-nerd',
          'https://www.linkedin.com/in/zachary-cohen-nerd/',
          'https://zcohennerd.substack.com/',
          'https://portfolio.zcohen-nerd.com/',
        ],
      }),
    },
    // Icons + a minimal, non-PWA web manifest (display: "browser", no service
    // worker). Docusaurus already emits <link rel="icon"> from `favicon`.
    {
      tagName: 'link',
      attributes: {rel: 'apple-touch-icon', href: '/apple-touch-icon.png'},
    },
    {tagName: 'link', attributes: {rel: 'manifest', href: '/site.webmanifest'}},
    {tagName: 'meta', attributes: {name: 'theme-color', content: '#0a1428'}},
    // Search Console verification — paste the token from Google Search Console /
    // Bing Webmaster Tools and uncomment, then rebuild. See
    // SEARCH-CONSOLE-CHECKLIST.md. (No console change has been made.)
    // {tagName: 'meta', attributes: {name: 'google-site-verification', content: 'REPLACE_ME'}},
    // {tagName: 'meta', attributes: {name: 'msvalidate.01', content: 'REPLACE_ME'}},
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

  // The only brand override the hub needs: add a Privacy link to the Footer's
  // "Connect" column (a secondary column, not primary nav). Everything else
  // (navLinks, attribution, isHub) still comes from @zcohen-nerd/brand's
  // DEFAULT_BRAND — but the spread replaces connectLinks wholesale, so the three
  // defaults are restated here.
  customFields: {
    brand: {
      connectLinks: [
        {label: 'GitHub', href: 'https://github.com/zcohen-nerd'},
        {
          label: 'LinkedIn',
          href: 'https://www.linkedin.com/in/zachary-cohen-nerd/',
        },
        {label: 'Email', href: 'mailto:zachary@zcohen-nerd.com'},
        {label: 'Privacy', href: '/privacy/'},
      ],
    },
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
