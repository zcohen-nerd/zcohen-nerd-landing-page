---
title: Privacy
description: What zcohen-nerd.com measures and does not measure — cookieless Plausible analytics, outbound-link events, and third-party boundaries.
slug: /privacy
wrapperClassName: privacy-page
---

# Privacy

This page describes exactly what `zcohen-nerd.com` collects. It is short because
the site does very little.

## Analytics

The site loads **[Plausible Analytics](https://plausible.io/)** — a
privacy-friendly, EU-hosted analytics service — from
`https://plausible.io/js/script.outbound-links.js`, deferred so it never blocks
the page.

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

## Outbound-link events

The `outbound-links` script variant also records an **"Outbound Link: Click"**
event, with the destination URL as a property, whenever you follow a link that
leaves the site (a project card, a nav link, a footer link). This is used only to
understand which parts of the ecosystem people move toward, in aggregate. It adds
no cookies and no personal data.

## Third-party destinations

Following an outbound link takes you to a different site — GitHub, LinkedIn,
Substack, the portfolio, the connector guide, and so on. Once you leave
`zcohen-nerd.com`, **that site's own privacy policy applies**, not this one. This
site does not control or receive data from those destinations.

## Fonts, media, and other requests

The site self-hosts its CSS, JavaScript, and images from `zcohen-nerd.com`. It
loads no third-party fonts, tag managers, ad networks, embedded videos, or social
widgets. The only cross-origin request the page makes is the Plausible script
described above.

## Contact

Questions about this page or a request related to your data:
**[zachary@zcohen-nerd.com](mailto:zachary@zcohen-nerd.com)**.

For Plausible's own handling of the aggregate data it processes, see the
[Plausible data policy](https://plausible.io/data-policy).
