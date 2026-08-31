---
title: Privacy
description: What zcohen-nerd.com measures and does not measure — cookieless Plausible analytics, cookieless Cloudflare edge analytics, outbound-link events, and third-party boundaries.
slug: /privacy
wrapperClassName: privacy-page
---

# Privacy

This page describes exactly what `zcohen-nerd.com` collects. It is short because
the site does very little. Two analytics systems run, and both are cookieless:
**Plausible** (loaded by the page) and **Cloudflare Web Analytics** (added at
Cloudflare's edge). Neither sets a cookie, writes to browser storage, or builds a
profile that follows you across sites.

## Plausible Analytics

The site loads **[Plausible Analytics](https://plausible.io/)** — a
privacy-friendly, EU-hosted analytics service — from
`https://plausible.io/js/script.outbound-links.js`, deferred so it never blocks
the page. This is a cross-origin request to `plausible.io`.

Plausible, as configured here:

- Sets **no cookies** and writes **nothing** to `localStorage` or
  `sessionStorage`.
- Stores **no personal data** and **no IP addresses**. It does not build a
  profile of you and cannot track you across sites or devices.
- Records only aggregate page views: the page URL, referrer, and coarse
  device/browser/country derived in-memory and then discarded.

The `data-domain` is `zcohen-nerd.com`; the property is registered in a Plausible
account owned by the site owner. No analytics keys or secrets live in this
repository.

### Outbound-link events

The `outbound-links` script variant also records an **"Outbound Link: Click"**
event, with the destination URL as a property, whenever you follow a link that
leaves the site (a project card, a nav link, a footer link). This is used only to
understand which parts of the ecosystem people move toward, in aggregate. It adds
no cookies and no personal data.

## Cloudflare (edge delivery and analytics)

`zcohen-nerd.com` is served through **Cloudflare**, which sits between your
browser and the GitHub Pages origin that hosts the built site. Cloudflare adds
two things to the page that are not in this repository's source:

- **Cloudflare Web Analytics.** Cloudflare injects a small script tag
  (`https://static.cloudflareinsights.com/beacon.min.js`) into the HTML at its
  edge. The script measures page performance (Core Web Vitals), page views, and
  referrers, and sends that data by a `POST` to `https://zcohen-nerd.com/cdn-cgi/rum`
  (a same-origin path that Cloudflare handles). Cloudflare Web Analytics is
  **cookieless**, does not use `localStorage`/`sessionStorage`, does not
  fingerprint, and does not track visitors across sites. It is aggregate traffic
  and performance measurement. See Cloudflare's
  [Web Analytics privacy notes](https://developers.cloudflare.com/web-analytics/data-metrics/data-collection/)
  and [Cloudflare's privacy policy](https://www.cloudflare.com/privacypolicy/).
- **Email address obfuscation.** Cloudflare serves a first-party script
  (`/cdn-cgi/scripts/…/email-decode.min.js`) that reassembles `mailto:` links in
  the browser so that address-harvesting bots see only scrambled markup. It sets
  no cookies and collects nothing.

Cloudflare also processes request metadata (IP address, user agent, timing) to
route and cache traffic and to protect the site, as any CDN or reverse proxy
does; that handling is governed by Cloudflare's privacy policy linked above,
not this page.

## Third-party destinations

Following an outbound link takes you to a different site — GitHub, LinkedIn,
Substack, the portfolio, the connector guide, and so on. Once you leave
`zcohen-nerd.com`, **that site's own privacy policy applies**, not this one. This
site does not control or receive data from those destinations.

## Fonts, media, and other requests

The site self-hosts its CSS, JavaScript, and images from `zcohen-nerd.com`. It
loads no third-party fonts, tag managers, ad networks, embedded videos, or social
widgets. The cross-origin requests the page makes are: the **Plausible** script
from `plausible.io`, and the **Cloudflare Web Analytics** beacon from
`static.cloudflareinsights.com` described above. Everything else is served from
`zcohen-nerd.com`.

## Contact

Questions about this page or a request related to your data:
**[zachary@zcohen-nerd.com](mailto:zachary@zcohen-nerd.com)**.

For each service's own handling of the aggregate data it processes, see the
[Plausible data policy](https://plausible.io/data-policy) and
[Cloudflare's privacy policy](https://www.cloudflare.com/privacypolicy/).
