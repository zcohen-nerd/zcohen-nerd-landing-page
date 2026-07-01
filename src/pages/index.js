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

function ProjectCard({project}) {
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
      <div className={styles.enter}>Enter →</div>
    </a>
  );
}

function PlaceholderCard() {
  return (
    <div className={styles.placeholder}>
      <div className={styles.placeholderTile} aria-hidden="true">
        ＋
      </div>
      <h3 className={styles.placeholderTitle}>More on the way</h3>
      <p className={styles.placeholderDesc}>
        Each new project branches off here, inheriting this same shell.
      </p>
    </div>
  );
}

function Ecosystem() {
  return (
    <section id="ecosystem" className={styles.ecosystem}>
      <div className={styles.sectionHead}>
        <div>
          <div className={styles.sectionEyebrow}>The ecosystem</div>
          <h2 className={styles.h2}>Everything in one place</h2>
        </div>
        <div className={styles.sectionMeta}>3 public projects · growing</div>
      </div>

      <div className={styles.grid}>
        {projects.map((p) => (
          <ProjectCard key={p.name} project={p} />
        ))}
        <PlaceholderCard />
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
      </main>
    </Layout>
  );
}
