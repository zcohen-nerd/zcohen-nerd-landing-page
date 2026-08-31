# NOTICE

This file records third-party materials bundled or referenced by this
repository, and the parts of the repository that are **not** covered by
[`LICENSE-CODE`](./LICENSE-CODE) or [`LICENSE-CONTENT.md`](./LICENSE-CONTENT.md).

## Excluded from the repository's own licenses (all rights reserved)

| Item | Notes |
|---|---|
| `static/img/zachary-cohen-headshot.jpg` | Personal photograph. Not licensed for reuse. |
| Résumé / CV files, if present | Personal document. Not licensed for reuse. |
| `static/img/work/*` (`sentry-turret-labeled.webp`, `spark-board-perspective.webp`, `surfer-on-water.webp`) | Project media. Each underlying project is published separately under its own repository and license; these images are used here by permission and are not re-licensed by this repository. |
| zcohen-nerd name, wordmark, logos, favicons | See [`TRADEMARKS.md`](./TRADEMARKS.md). |
| Any institutional or employer material | Referenced for factual/biographical accuracy only. Rights belong to the respective institutions. Not licensed for reuse. |

## Third-party software

Build- and runtime dependencies are declared in `package.json` and locked in
`package-lock.json`; each carries its own license (retrieved with
`npm view <pkg> license` or from `node_modules/<pkg>/LICENSE`). Notable
first-order dependencies:

| Package | License |
|---|---|
| `@docusaurus/core`, `@docusaurus/preset-classic` (Docusaurus, incl. the Infima CSS framework) | MIT |
| `@mdx-js/react` | MIT |
| `react`, `react-dom` | MIT |
| `clsx` | MIT |
| `prism-react-renderer` | MIT |
| `@zcohen-nerd/brand` | Split license — MIT code + reserved marks (see that package's `LICENSE.md`) |

## Third-party services

| Service | Use | Notes |
|---|---|---|
| Plausible Analytics (`plausible.io/js/script.outbound-links.js`) | Privacy-friendly, cookieless page-view and outbound-link analytics | No cookies, no personal data, no cross-site tracking. See `/privacy/`. The script is loaded from Plausible's CDN and is not vendored in this repository. |

No web fonts are loaded from third-party hosts.
