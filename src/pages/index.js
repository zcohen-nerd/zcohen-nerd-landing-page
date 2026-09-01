import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import projects from '@zcohen-nerd/brand/src/data/projects';
import styles from './index.module.css';

/**
 * zcohen-nerd hub landing page — "Systems Index".
 *
 * Header → Hero → Selected engineering work → Ecosystem grid → Current focus →
 * Footer. The Header and Footer come from the shared @zcohen-nerd/brand theme
 * (rendered by @theme/Layout). This page owns the Hero, a curated
 * "Selected engineering work" proof layer, and the ecosystem grid — the last of
 * which maps over the canonical project registry so adding a project is a
 * one-line registry edit.
 *
 * The "Selected engineering work" section is a deliberately hand-picked
 * professional proof layer, NOT a second global registry: it features exactly
 * three flagship systems and links each to its canonical Portfolio page.
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
          {/*
            Capability qualifier. Wording is derived from the Portfolio "About"
            page ("Senior Electromechanical Systems Engineer", "cross-domain
            electromechanical integration", "autonomous maritime systems",
            "autonomous marine and robotics platforms", "field-deployable
            autonomous platforms", "prototype-to-field transition"). It states
            scope of work only — no specialty or availability claim.
          */}
          <p className={styles.heroQualifier}>
            Work spanning autonomous maritime systems, robotics, embedded
            hardware, and systems integration &mdash; carried from architecture
            through field deployment.
          </p>
          <div className={styles.heroByline}>
            <img
              className={styles.heroBylinePhoto}
              src="/img/responsive/zachary-cohen-headshot-104w.webp"
              srcSet="/img/responsive/zachary-cohen-headshot-52w.webp 52w, /img/responsive/zachary-cohen-headshot-104w.webp 104w, /img/responsive/zachary-cohen-headshot-156w.webp 156w"
              sizes="52px"
              alt="Portrait of Zac Cohen"
              width="52"
              height="52"
              decoding="async"
            />
            <div>
              <div className={styles.heroBylineName}>Zac Cohen</div>
              <div className={styles.heroBylineTitle}>
                Senior electromechanical systems engineer · maker · educator
              </div>
            </div>
          </div>
          <div className={styles.heroButtons}>
            <a href="#selected-work" className={styles.btnPrimary}>
              See selected engineering work <span aria-hidden="true">↓</span>
            </a>
            <a href="#ecosystem" className={styles.btnSecondary}>
              Explore the full ecosystem
            </a>
          </div>
          <a href="/about" className={styles.heroTertiary}>
            About Zac <span aria-hidden="true">→</span>
          </a>
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

/**
 * Curated flagship systems — the professional proof layer.
 *
 * Every field is drawn from the canonical Portfolio project page it links to
 * (surfer-fleet, sentry-v3, stlink-v3mods). `status` matches the maturity
 * label on that page's front matter. `evidence` is a single verifiable
 * outcome signal quoted/paraphrased from the source page's "At a glance".
 * This list is intentionally hand-maintained and is NOT the shared registry.
 */
const SELECTED_WORK = [
  {
    name: 'SURFER Autonomous Vessel Fleet',
    href: 'https://portfolio.zcohen-nerd.com/projects/surfer-fleet/',
    status: 'Deployed',
    problem:
      'A 20-vessel holonomic autonomous surface-vehicle fleet for scaled maritime-autonomy research — ten vessels run concurrently in a Spring 2026 course.',
    role: 'Owned the full vessel redesign and its systems integration — architecture, one-piece SLA hull, four custom circuit boards, and embedded firmware through first-water deployment; faculty own the higher-level autonomy software.',
    evidence:
      'First redesigned vessel deployed in 2025; per-hull fabrication cost cut from ≈$2,500 to ≈$400 and the print-failure rate from ≈70% to ≈10%.',
    image: {
      src: '/img/work/surfer-on-water.webp',
      alt: 'A redesigned SURFER vessel on the water during testing, camera mast and emergency-stop button visible.',
      width: 1600,
      height: 1205,
    },
    accent: '#10b8d8',
  },
  {
    name: 'SENTRY V3',
    href: 'https://portfolio.zcohen-nerd.com/projects/sentry-v3/',
    status: 'Deployed',
    problem:
      'A pan-tilt robotic turret that consolidates motor control, sensing, and safety into one RP2040 embedded controller — a maintainable mechatronics teaching platform.',
    role: 'Architected and built the platform end to end — system and electromechanical architecture, mechanical design, control electronics and PCB, and reference firmware; users’ vision and targeting software runs on external compute.',
    evidence:
      'Used by 100+ students per year in its U.S. Naval Academy deployment, released publicly as open source, and selected for an Autodesk University 2025 presentation.',
    image: {
      src: '/img/work/sentry-turret-labeled.webp',
      alt: 'Labeled CAD view of the SENTRY V3 pan-tilt turret assembly showing its major subsystems.',
      width: 1942,
      height: 1000,
    },
    accent: '#e11d48',
  },
  {
    name: 'SPARK Programming Board',
    href: 'https://portfolio.zcohen-nerd.com/projects/stlink-v3mods/',
    status: 'Prototype',
    problem:
      'A hardened breakout and target-interface board for the STLINK-V3MODS debugger — protected power entry, default-off switched target rails, hybrid level translation, and CAN FD.',
    role: 'Sole designer — schematic, 4-layer PCB, protection and power architecture, and the fabrication package (ODB++, BOM) in the open-source repository.',
    evidence:
      'Design complete — schematic, 4-layer PCB, ODB++ fabrication package, and BOM in the repository. A bench-validation plan is defined; it has not been executed and no fabrication, assembly, or measurement records are published.',
    image: {
      src: '/img/work/spark-board-perspective.webp',
      alt: 'Perspective CAD render of the SPARK programming board and its debug interface headers.',
      width: 1046,
      height: 697,
    },
    accent: '#7c3aed',
  },
];

// Status pill palette — mirrors the registry's status colours so a "Deployed"
// system reads the same here as a "Live" destination does in the grid below.
const WORK_STATUS_STYLE = {
  Deployed: {color: '#277048', background: 'rgba(46,133,85,.1)'},
  Prototype: {color: '#8a5600', background: 'rgba(176,111,0,.12)'},
};

// The card media renders in a ~340px box; hand the browser 340/512/768/1024 w
// WebP variants generated by scripts/gen-image-variants.mjs. Convention:
// /img/work/<name>.webp -> /img/work/responsive/<name>-<w>w.webp
const WORK_IMG_WIDTHS = [340, 512, 768, 1024];
function workSrcSet(src) {
  const m = src.match(/^(.*)\/([^/]+)\.webp$/);
  if (!m) return undefined;
  const [, dir, name] = m;
  return WORK_IMG_WIDTHS.map(
    (w) => `${dir}/responsive/${name}-${w}w.webp ${w}w`,
  ).join(', ');
}

function SelectedWorkCard({item}) {
  const pill = WORK_STATUS_STYLE[item.status] || WORK_STATUS_STYLE.Prototype;
  return (
    <a
      href={item.href}
      className={styles.workCard}
      style={{'--card-accent': item.accent}}
    >
      <div className={styles.workMedia}>
        <img
          src={item.image.src}
          srcSet={workSrcSet(item.image.src)}
          sizes="(max-width: 900px) 46vw, 340px"
          alt={item.image.alt}
          width={item.image.width}
          height={item.image.height}
          loading="lazy"
          decoding="async"
          className={styles.workImg}
        />
      </div>
      <div className={styles.workBody}>
        <div className={styles.workTop}>
          <h3 className={styles.workTitle}>{item.name}</h3>
          <span
            className={styles.workStatus}
            style={{color: pill.color, background: pill.background}}
          >
            {item.status}
          </span>
        </div>
        <p className={styles.workProblem}>{item.problem}</p>
        <p className={styles.workMeta}>
          <span className={styles.workMetaLabel}>Role</span>
          {item.role}
        </p>
        <p className={styles.workMeta}>
          <span className={styles.workMetaLabel}>Evidence</span>
          {item.evidence}
        </p>
        <span className={styles.workEnter} aria-hidden="true">
          View project on the Portfolio →
        </span>
      </div>
    </a>
  );
}

function SelectedWork() {
  return (
    <section id="selected-work" className={styles.selectedWork}>
      <div className={styles.selectedWorkInner}>
        <div className={styles.sectionHeadSelected}>
          <div className={styles.sectionEyebrow}>Proof layer</div>
          <h2 className={styles.h2}>Selected engineering work</h2>
        </div>
        <p className={styles.sectionSub}>
          A few flagship electromechanical systems — autonomous maritime,
          robotics, and embedded hardware. Each links to its full write-up on
          the engineering Portfolio.
        </p>
        <div className={styles.workGrid}>
          {SELECTED_WORK.map((item) => (
            <SelectedWorkCard key={item.name} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
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
      }}
    >
      <div className={styles.cardTop}>
        <div className={styles.iconTile} aria-hidden="true">
          {project.emoji}
        </div>
        <span
          className={styles.statusPill}
          style={{color: project.status.color, background: project.status.bg}}
        >
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
        <SelectedWork />
        <Ecosystem />
        <CurrentFocus />
      </main>
    </Layout>
  );
}
