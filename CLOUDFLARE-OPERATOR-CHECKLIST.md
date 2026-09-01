# Cloudflare operator checklist — `zcohen-nerd.com` zone

Everything in this file is an **operator action**. It requires the Cloudflare
dashboard for the `zcohen-nerd.com` zone, and it is **not** performed by any
build, script, or CI job in this repository — Cloudflare exposes no credential
to this workspace. Each item lists the exact rule to create and how to verify it
from a shell afterward.

`zcohen-nerd.com` (+ `www`) is proxied through Cloudflare in front of the
GitHub Pages origin. `portfolio.zcohen-nerd.com` and the connector guide
(`zcohen-nerd.github.io/connector-engineering-field-guide/`) are served by
GitHub Pages **directly** — see §F.

Live baseline captured 2026-09-01:

| Header | `zcohen-nerd.com` | `portfolio.zcohen-nerd.com` | guide |
| --- | --- | --- | --- |
| Server | `cloudflare` | `GitHub.com` | `GitHub.com` |
| CSP | present (see §A) | — | — |
| HSTS | `max-age=2592000` | — | `max-age=31556952` (github.io's own) |
| Referrer-Policy | `strict-origin-when-cross-origin` | — | — |
| X-Content-Type-Options | `nosniff` | — | — |
| Permissions-Policy | present | — | — |
| Cache-Control (HTML) | `max-age=600` | `max-age=600` | `max-age=600` |

---

## A. Web Analytics decision + CSP alignment

**Current state:** Cloudflare Web Analytics is **enabled**. The live CSP
`script-src` and `connect-src` both allow `https://static.cloudflareinsights.com`,
the beacon loads on every route, and `POST https://zcohen-nerd.com/cdn-cgi/rum`
fires. `/privacy/` and `NOTICE.md` describe this accurately.

Two supported end states — pick one and make prose, NOTICE, CSP, and the live
requests agree exactly:

### Option 1 — keep Web Analytics (no change)

Nothing to do. `/privacy/` and `NOTICE.md` already document it. This is the
current, accurate state.

### Option 2 — disable Web Analytics

1. **Cloudflare dashboard → Analytics & Logs → Web Analytics →** the
   `zcohen-nerd.com` site → **Manage site → Disable / Remove**. (Also turn off
   *Speed → Optimization → Content Optimization → "Cloudflare Web Analytics"
   automatic injection* if it is on there instead.)
2. Edit the **Transform Rule** that sets the response headers (Rules → Transform
   Rules → *Modify Response Header*) and remove `https://static.cloudflareinsights.com`
   from **both** `script-src` and `connect-src` in the `Content-Security-Policy`
   value. Leave the two `sha256-…` hashes and `https://plausible.io`.
3. In this repo, edit **`src/pages/privacy.md`** — delete the
   "Cloudflare (edge delivery and analytics)" analytics paragraph (keep the
   CDN / Email-Obfuscation description) — and **`NOTICE.md`** — delete the
   *Cloudflare Web Analytics* row. Commit.
4. Edit **`scripts/check-third-party-origins.mjs`**: remove
   `'https://static.cloudflareinsights.com'` from `LIVE_ALLOWLIST`. The live
   deploy smoke test then fails if the beacon ever comes back.

**Verify (either option):**

```bash
curl -sS https://zcohen-nerd.com/ -o /dev/null -D - | grep -i content-security-policy
# then load the site in a browser with devtools → Network and confirm the set of
# cross-origin requests matches /privacy/ exactly.
node scripts/check-third-party-origins.mjs --mode live --base https://zcohen-nerd.com
```

---

## B. Cache-Control rules

**Goal:** content-hashed assets cached hard and forever; everything a deploy can
change stays revalidatable.

Docusaurus fingerprints JS/CSS under `/assets/…<hash>.js|css` and images it
processes under `/assets/…`. `static/` files (favicons, `manifest`, `robots.txt`,
`sitemap.xml`, the `img/**` photos and their `responsive/` variants) keep their
plain names and can change on any deploy.

Create two **Cache Rules** (Rules → Cache Rules), ordered:

### B1 — immutable hashed build output

- **If** `(http.request.uri.path matches "^/assets/.*\\.(js|css|woff2?|png|jpe?g|webp|avif|svg)$")`
- **Then** → Cache eligibility: *Eligible for cache*; Edge TTL: *Override* →
  `1 year`; Browser TTL: *Override* → `1 year`.
- Add a **Response Header Transform Rule** on the same match setting
  `Cache-Control: public, max-age=31536000, immutable`.

### B2 — revalidatable everything-else

- **If** `(http.request.uri.path matches "\\.(html|xml|txt|json|webmanifest)$")
  or (http.request.uri.path eq "/") or (starts_with(http.request.uri.path, "/img/"))`
- **Then** → Edge TTL: *Override* → `10 minutes`; Browser TTL: *Respect origin*.
- Response Header Transform: `Cache-Control: public, max-age=0, must-revalidate`
  for `\.(html|xml|txt|json|webmanifest)$` and the bare `/`; leave `/img/**` at
  `max-age=600` (they are not fingerprinted but rarely change).

**Verify:**

```bash
curl -sS -D - -o /dev/null https://zcohen-nerd.com/                    | grep -i cache-control   # max-age=0, must-revalidate
curl -sS -D - -o /dev/null https://zcohen-nerd.com/sitemap.xml         | grep -i cache-control   # max-age=0, must-revalidate
curl -sS -D - -o /dev/null "$(curl -sS https://zcohen-nerd.com/ | grep -o '/assets/js/[^"]*\.js' | head -1 | sed 's#^#https://zcohen-nerd.com#')" | grep -i cache-control  # max-age=31536000, immutable
```

---

## C. `http://www` → `https://zcohen-nerd.com` in one hop

Today `www` resolves but multi-hops (`http://www` → `https://www` → apex).
Collapse it:

- Rules → **Redirect Rules** → Create.
- **If** `(http.host eq "www.zcohen-nerd.com") or (http.host eq "zcohen-nerd.com" and not ssl)`
- **Then** → *Static* redirect, **301**, to
  `concat("https://zcohen-nerd.com", http.request.uri.path)`, *Preserve query string* on.

**Verify:**

```bash
curl -sS -I http://www.zcohen-nerd.com/about/  | grep -iE '^HTTP|^location'   # one 301 straight to https://zcohen-nerd.com/about/
curl -sS -I http://zcohen-nerd.com/            | grep -iE '^HTTP|^location'   # 301 to https://zcohen-nerd.com/
```

---

## D. AI-crawler blocking policy

**Current state (intentional):** Cloudflare's managed **"Block AI bots"** /
*AI Scrapers and Crawlers* control is **ON** for this zone. This is a
deliberate default — the site's content is not offered for AI-training
ingestion.

**Do not silently enable AI-training crawlers.** If that policy is ever to
change it is an explicit, recorded decision by the site owner, not a
side effect of another change.

- Where: Cloudflare dashboard → **Security → Bots** (or **Security → Settings**
  on the newer UI) → *Block AI bots* / *AI Scrapers and Crawlers*.
- To loosen it: turn the managed rule to *Off* or *Managed challenge*, and
  record the date + rationale here and in `NOTICE.md`.
- `robots.txt` in this repo is a courtesy signal only; the Cloudflare rule is
  the enforcement.

**Verify the rule is active:**

```bash
curl -sS -A "GPTBot/1.0 (+https://openai.com/gptbot)" -I https://zcohen-nerd.com/ | grep -iE '^HTTP'   # expect 403 / 429 / challenge, not 200
```

---

## E. HSTS staged ramp (no preload in this task)

**Current:** `Strict-Transport-Security: max-age=2592000` (30 days), no
`includeSubDomains`, no `preload`.

**Preconditions before raising it — verify every host answers on HTTPS only:**

```bash
for h in zcohen-nerd.com www.zcohen-nerd.com portfolio.zcohen-nerd.com; do
  echo "$h:"; curl -sS -I "http://$h/" | grep -iE '^HTTP|^location'
done
# each must 301/308 to its https:// equivalent. If any subdomain is ever added
# that must serve plain HTTP, do NOT add includeSubDomains.
```

**Ramp (one step per deploy window, watch for breakage between):**

1. `max-age=15552000` (180 days) — no `includeSubDomains`.
2. After ~1–2 weeks clean: `max-age=31536000` (1 year).
3. `includeSubDomains` **only** once every current and planned
   `*.zcohen-nerd.com` host is confirmed HTTPS-only (step E preconditions).
   `portfolio.zcohen-nerd.com` is GitHub Pages and is HTTPS-only, so this is
   currently safe — re-check before flipping.
4. **`preload` — out of scope for this task. Do not add it.** Preload is
   effectively irreversible; it is a separate, deliberate decision.

Set via the same *Modify Response Header* Transform Rule that carries the CSP.

**Verify after each step:**

```bash
curl -sS -I https://zcohen-nerd.com/ | grep -i strict-transport-security
```

---

## F. Portfolio + guide header limitation (accepted)

`portfolio.zcohen-nerd.com` and the connector guide are served by **GitHub
Pages directly** (confirmed: `Server: GitHub.com`, no CSP/HSTS/Referrer-Policy/
Permissions-Policy on either). GitHub Pages does not let you set custom response
headers, and there is **no `_headers` file support**.

**Decision: accepted as-is.** Putting these behind the Cloudflare proxy purely
to attach a CSP would add a moving part (proxy config, cache rules, another
place for the apex/`www` logic to live) for a static content site with no
credentialed surface, no user input, and no third-party scripts on the
portfolio. The guide loads no analytics and no cross-origin resources.

If a real need appears later (e.g. embedding third-party media), the migration
is: add the subdomain to the Cloudflare zone as a proxied CNAME, then replicate
§B (cache) and the CSP/security-header Transform Rule from the apex. Until then,
the GitHub Pages defaults (HTTPS-enforced, `X-GitHub-Request-Id`, github.io's
own HSTS on the guide origin) are the accepted posture.
