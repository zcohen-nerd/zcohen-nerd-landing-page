import React from 'react';

/**
 * Custom 404 content (swizzled @theme/NotFound/Content).
 * Rendered inside the standard Layout, so the shared Navbar/Footer and
 * Ecosystem navigation remain available.
 */
export default function NotFoundContent() {
  return (
    <main
      style={{
        maxWidth: 640,
        margin: '0 auto',
        padding: '96px 24px 120px',
        textAlign: 'center',
      }}>
      <h1 style={{fontSize: 40, marginBottom: 12}}>Page not found</h1>
      <p style={{fontSize: 17, lineHeight: 1.6}}>
        That page isn&rsquo;t part of the ecosystem — it may have moved, or the
        link is out of date.
      </p>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          marginTop: 28,
          fontSize: 16,
          lineHeight: 2.2,
        }}>
        <li>
          <a href="/">Return to the hub →</a>
        </li>
        <li>
          <a href="/about/">About Zac →</a>
        </li>
        <li>
          <a href="https://portfolio.zcohen-nerd.com/">Visit the portfolio →</a>
        </li>
        <li>
          <a href="/#ecosystem">See every destination →</a>
        </li>
      </ul>
    </main>
  );
}
