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

## Deployment

Deploys automatically to GitHub Pages on every push to `main` via GitHub Actions. Live at **[www.zcohen-nerd.com](https://www.zcohen-nerd.com)**.
