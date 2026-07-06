# zcohen-nerd landing page

The hub landing page for **[www.zcohen-nerd.com](https://www.zcohen-nerd.com)** — a single-page directory routing visitors to every project in the zcohen-nerd ecosystem.

Built with [Docusaurus](https://docusaurus.io/), consuming the shared [`@zcohen-nerd/brand`](https://github.com/zcohen-nerd/zcohen-nerd-brand) package for the Navbar, Footer, design tokens, and project registry.

## What's on the site

- **Hero** — introduction and navigation to the ecosystem
- **Ecosystem grid** — cards for every active project, data-driven from the shared project registry
- **About** — background on the work and the person behind it

## Projects in the ecosystem

| Project | Status | URL |
|---|---|---|
| Portfolio | Live | [zcohen-nerd.github.io/Portfolio](https://zcohen-nerd.github.io/Portfolio/) |
| Literacy for Kids | Live | [literacy-for-kids.github.io/literacy_for_kids](https://literacy-for-kids.github.io/literacy_for_kids/) |
| Connector Guide | In progress | [zcohen-nerd.github.io/connector-engineering-field-guide](https://zcohen-nerd.github.io/connector-engineering-field-guide/) |

## Local development

Requires the brand package to be cloned alongside this repo:

```bash
git clone https://github.com/zcohen-nerd/zcohen-nerd-brand.git ../zcohen-nerd-brand
git clone https://github.com/zcohen-nerd/zcohen-nerd-landing-page.git
cd zcohen-nerd-landing-page
npm install
npm start
```

## Analytics

Privacy-friendly analytics via [Plausible](https://plausible.io/) — cookieless, no personal data. The script is configured in `docusaurus.config.js` (`scripts` array, `data-domain="zcohen-nerd.com"`). The `outbound-links` script variant automatically records an "Outbound Link: Click" event for every click leaving the site, so project cards and nav/footer links are tracked by destination URL with no per-link markup. To add a custom event later, call `window.plausible('Event Name')` in a click handler (guard with `if (window.plausible)`).

Account-side setup: the `zcohen-nerd.com` site must be registered in the Plausible account for data to be accepted.

## Deployment

Deploys automatically to GitHub Pages on every push to `main` via GitHub Actions. Live at **[www.zcohen-nerd.com](https://www.zcohen-nerd.com)**.
