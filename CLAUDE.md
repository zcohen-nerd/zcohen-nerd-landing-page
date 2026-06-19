# zcohen-nerd-landing-page

This is the **hub landing page** for `www.zcohen-nerd.com` — a single-page directory that routes visitors to every project in the zcohen-nerd ecosystem. It is built on Docusaurus and consumes the `zcohen-nerd-brand` shared package.

## Stack
- **Docusaurus** (static site, no MDX content — it's a custom homepage, not a docs site)
- **`zcohen-nerd-brand`** package for the Navbar, Footer, tokens, and project registry

## Page structure
One scrolling page (`src/pages/index.js` or `index.tsx`):
1. **Header** — comes from the shared `zcohen-nerd-brand` Navbar (sticky, blurred, Projects ▾ dropdown)
2. **Hero** — navy gradient, amber signal dot eyebrow, H1, subcopy, two buttons
3. **Ecosystem grid** — 2-column card grid, each card driven from the project registry (`projects.js`)
4. **Footer** — comes from the shared `zcohen-nerd-brand` Footer

## Design reference
The full design spec and all measurements are in `design_handoff_zcohen_nerd_landing/README.md`. The finalized HTML mockup is `design_handoff_zcohen_nerd_landing/zcohen-nerd Landing.dc.html` — open it in a browser to see the exact intended result.

Fidelity: **high-fidelity**. Recreate pixel-faithfully using Docusaurus patterns. Do not copy the HTML verbatim — it uses a prototype runtime. Use it as a visual spec.

## Theming
This site uses the **parent zcohen-nerd theme** — no `data-theme` attribute needed. `--zc-color-primary` is navy `#102040`, accent is cyan `#10b8d8`.

## Project cards
The ecosystem grid is **data-driven** — import the project registry from `zcohen-nerd-brand/src/data/projects.js` and `.map()` over it. Do not hardcode individual cards. Adding a new project means one entry in that registry file; this page rebuilds automatically.

Card shape: accent `border-top: 4px solid <project.accent>`, emoji icon tile, title, description, status pill, "Enter →" link. Hover lifts `translateY(-2px)` + deepens shadow. The last "slot" is a static placeholder ("More on the way") appended after the map.

## Domain / routing note
This site will eventually be served at the root domain `zcohen-nerd.com`. Other projects route off subpaths (`/portfolio`, `/literacy`, `/connectors`) via a reverse proxy or Netlify/Vercel/Cloudflare rewrites. Set `baseUrl: '/'` in `docusaurus.config.js`. Each other site sets its own `baseUrl` matching its subpath.

## Key files to create / edit
- `src/pages/index.js` — the landing page component
- `src/css/custom.css` — imports brand tokens + Infima bridge; sets `html { data-theme: "" }` (parent theme)
- `docusaurus.config.js` — navbar/footer set to empty (overridden by brand package swizzles); `baseUrl: '/'`
- `static/img/` — copy logo assets from `zcohen-nerd-brand/assets/`

## Key decisions already made — don't relitigate
- No blog, no docs section — this is a pure custom homepage, not a content site
- Project list is data-driven from the shared registry
- System-ui font, no webfont loading
- Emoji as project icons
