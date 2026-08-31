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
| Plausible Analytics (`plausible.io/js/script.outbound-links.js`) | Cookieless page-view and outbound-link analytics | No cookies, no personal data, no cross-site tracking. Cross-origin script from `plausible.io`. See `/privacy/`. Not vendored in this repository. |
| Cloudflare Web Analytics (`static.cloudflareinsights.com/beacon.min.js`, `POST /cdn-cgi/rum`) | Cookieless traffic + Core Web Vitals measurement | **Injected by Cloudflare at the edge — not present in this repository's source.** `zcohen-nerd.com` is proxied through Cloudflare in front of the GitHub Pages origin. Cookieless, no browser storage, no cross-site profiling. Governed by [Cloudflare's privacy policy](https://www.cloudflare.com/privacypolicy/). See `/privacy/`. |
| Cloudflare Email Obfuscation (`/cdn-cgi/scripts/…/email-decode.min.js`) | Reassembles `mailto:` links in the browser to defeat address harvesters | First-party script injected by Cloudflare at the edge. No cookies, collects nothing. |
| Cloudflare CDN / reverse proxy | TLS termination, caching, routing, DDoS protection for `zcohen-nerd.com` | Processes request metadata (IP, user agent, timing) as any CDN does. Governed by Cloudflare's privacy policy. |

The Cloudflare items above are configured on the `zcohen-nerd.com` Cloudflare
zone, not in this repository. If Cloudflare Web Analytics is disabled, the
`static.cloudflareinsights.com` / `/cdn-cgi/rum` entries and the matching
Content-Security-Policy allowances should be removed to match.

No web fonts are loaded from third-party hosts.
