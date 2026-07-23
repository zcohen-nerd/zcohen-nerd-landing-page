import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import projects from '@zcohen-nerd/brand/src/data/projects';
import styles from './index.module.css';

/**
 * zcohen-nerd hub landing page — "Systems Index".
 *
 * Header → Hero → Ecosystem grid → Footer. The Header and Footer come from the
 * shared @zcohen-nerd/brand theme (rendered by @theme/Layout). This page owns
 * the Hero and the ecosystem grid, which maps over the canonical project
 * registry so adding a project is a one-line registry edit.
 */

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={styles.heroInner}>
        <div className={styles.heroContent}>
          <div className={styles.eyebrow}>
            <span className={styles.signalDot} aria-hidden="true" />
            home base · v2.0
          </div>
          <h1 className={styles.h1}>
            Practical engineering,
            <br />
            systems thinking, and
            <br />
            modern literacy.
          </h1>
          <p className={styles.subcopy}>
            A home base for the engineering projects, technical guides, and
            education resources I&rsquo;m building in public.
          </p>
          <div className={styles.heroByline}>
            <img
              className={styles.heroBylinePhoto}
              src="/img/zachary-cohen-headshot.jpg"
              alt="Portrait of Zac Cohen"
            />
            <div>
              <div className={styles.heroBylineName}>Zac Cohen</div>
              <div className={styles.heroBylineTitle}>
                Electromechanical systems engineer · maker · educator
              </div>
            </div>
          </div>
          <div className={styles.heroButtons}>
            <a href="#ecosystem" className={styles.btnPrimary}>
              Explore the projects <span aria-hidden="true">↓</span>
            </a>
            <a href="/about" className={styles.btnSecondary}>
              About me
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * A link is "external" when it leaves the zcohen-nerd.com domain family
 * (subdomains like portfolio.zcohen-nerd.com are family). External links get
 * a visible ↗ indicator plus screen-reader text.
 */
function isExternal(href) {
  try {
    const host = new URL(href, 'https://zcohen-nerd.com').hostname;
    return host !== 'zcohen-nerd.com' && !host.endsWith('.zcohen-nerd.com');
  } catch {
    return false;
  }
}

function ProjectCard({project}) {
  const external = isExternal(project.href);
  return (
    <a
      href={project.href}
      className={styles.card}
      style={{
        '--card-accent': project.accent,
        '--card-soft': project.accentSoft,
        '--card-tint': project.accentTint,
        '--card-enter': project.enterColor,
      }}>
      <div className={styles.cardTop}>
        <div className={styles.iconTile} aria-hidden="true">
          {project.emoji}
        </div>
        <span
          className={styles.statusPill}
          style={{color: project.status.color, background: project.status.bg}}>
          {project.status.label}
        </span>
      </div>
      <h3 className={styles.cardTitle}>{project.name}</h3>
      <p className={styles.cardDesc}>{project.blurb}</p>
      <div className={styles.enter}>
        {external ? (
          <>
            Enter <span aria-hidden="true">↗</span>
            <span className="sr-only">(opens external site)</span>
          </>
        ) : (
          'Enter →'
        )}
      </div>
    </a>
  );
}

function Ecosystem() {
  const featured = projects.filter((p) => p.featured);
  const tools = projects.filter((p) => !p.featured);
  return (
    <section id="ecosystem" className={styles.ecosystem}>
      <div className={styles.sectionHead}>
        <div>
          <div className={styles.sectionEyebrow}>Start here</div>
          <h2 className={styles.h2}>Featured destinations</h2>
        </div>
        <div className={styles.sectionMeta}>
          {projects.length} public destinations &amp; tools · growing
        </div>
      </div>
      <p className={styles.sectionSub}>
        The main destinations across my engineering, education, and
        documentation work.
      </p>

      <div className={styles.grid}>
        {featured.map((p) => (
          <ProjectCard key={p.name} project={p} />
        ))}
      </div>

      <div className={styles.sectionHeadSecondary}>
        <div className={styles.sectionEyebrow}>Open tools &amp; systems</div>
        <h2 className={styles.h2}>Engineering tools &amp; projects</h2>
      </div>
      <p className={styles.sectionSub}>
        Open tools and hands-on systems spanning CAD, embedded development,
        automation, and mechatronics.
      </p>

      <div className={styles.grid}>
        {tools.map((p) => (
          <ProjectCard key={p.name} project={p} />
        ))}
      </div>
    </section>
  );
}

// What's actively receiving attention. Durable themes only — no release
// dates or cadence promises. Links derive from the shared registry.
const FOCUS_ITEMS = [
  {
    title: 'Engineering tools',
    copy: 'Building practical tools that connect systems architecture, CAD, embedded development, and hardware workflows.',
    project: 'Fusion System Blocks',
  },
  {
    title: 'Engineering documentation',
    copy: 'Expanding guides and methods that make multidisciplinary systems easier to understand, review, and maintain.',
    project: 'Connector Guide',
  },
  {
    title: 'Open education',
    copy: 'Developing approachable curricula for computer literacy, engineering design, and systems thinking.',
    project: 'Literacy for Kids',
  },
  {
    title: 'Writing',
    copy: 'Publishing occasional essays about engineering judgment, feedback loops, and systems that outlive their creators.',
    project: 'Writing',
  },
];

function CurrentFocus() {
  return (
    <section className={styles.focus}>
      <div className={styles.focusInner}>
        <div className={styles.sectionEyebrow}>Current focus</div>
        <h2 className={styles.h2}>What&rsquo;s getting attention right now</h2>
        <div className={styles.focusGrid}>
          {FOCUS_ITEMS.map((f) => {
            const p = projects.find((proj) => proj.name === f.project);
            if (!p) {
              return null;
            }
            return (
              <div key={f.title} className={styles.focusItem}>
                <h3 className={styles.focusTitle}>{f.title}</h3>
                <p className={styles.focusCopy}>{f.copy}</p>
                <a href={p.href} className={styles.focusLink}>
                  {p.name}
                  {isExternal(p.href) && (
                    <>
                      {' '}
                      <span aria-hidden="true">↗</span>
                      <span className="sr-only">(opens external site)</span>
                    </>
                  )}{' '}
                  →
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main className={styles.main}>
        <Hero />
        <Ecosystem />
        <CurrentFocus />
      </main>
    </Layout>
  );
}
