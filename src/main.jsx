import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/instrument-sans';
import '@fontsource-variable/bricolage-grotesque';
import { FaArrowDownLong, FaEnvelope, FaGithub, FaGlobe, FaLinkedinIn, FaYoutube } from 'react-icons/fa6';
import LightRays from './LightRays.jsx';
import WarmTooltip, { WarmTooltipGroup } from './WarmTooltip.jsx';
import ScrollFloat from './ScrollFloat.jsx';
import './style.css';

const BlobCursor = React.lazy(() => import('./BlobCursor.jsx'));

const projects = Object.values(import.meta.glob('./projects/*.json', { eager: true, import: 'default' }))
  .sort((a, b) => a.order - b.order);

const experience = [
  {
    category: 'Robotics',
    role: 'Head programmer',
    organization: 'VEX Team 42747R',
    detail: 'I write autonomous code in C++ for Team 42747R using PROS and EZ-Template. A lot of that work is about helping the robot understand where it is, including Extended Kalman Filter and Monte Carlo localization approaches. Our team has competed at VEX States.',
  },
  {
    category: 'Teaching',
    role: 'AP CS teaching assistant',
    organization: 'West Morris Mendham',
    detail: 'I helped build a course website for AP Computer Science Principles lessons, activities, and student resources, and I assist with classroom instruction. Outside school, I teach coding fundamentals to 10 elementary students and help seven more advanced students work through their own projects at Oakland Gurudwara.',
  },
  {
    category: 'Research',
    role: 'Student researcher',
    organization: 'Algoverse Research',
    detail: 'I’m working on a paper about success-guided activation steering (SGAS): can a model’s hidden states tell us when steering will actually help it refuse a harmful request, without making it refuse harmless ones? I build the inference and activation-capture pipelines, and I’m responsible for reproducing CAST, a published method that decides when to steer based on predicted harm. We’re comparing the two approaches at the same level of safety. The paper is still in progress.',
  },
  {
    category: 'Community',
    role: 'Hackathon organizer',
    organization: 'Hack Club & Haven',
    detail: 'I ran Fanpage YSWS with Hack Club, a two-week coding event with 16 submissions and 251 recorded programming hours. I’m also organizing Haven, a two-day student hackathon in Princeton planned for November 14–15, 2026. That work includes sponsor outreach, event logistics, and raising over $4,000 in prize value.',
  },
];

const skills = [
  { label: 'Languages', items: 'Python, JavaScript, TypeScript, C/C++, Swift, HTML/CSS' },
  { label: 'Frameworks', items: 'React, Electron, Express, SwiftUI, Flask' },
  { label: 'Tools', items: 'SQLite, Git, MapKit, PROS' },
  { label: 'Data & ML', items: 'PyTorch, scikit-learn, Pandas, NumPy' },
  { label: 'Agent tools', items: 'LangChain, LangGraph, MCP, OpenAI API, Codex' },
];

const portfolios = {
  programming: {
    label: 'Software & web',
    title: 'Programming portfolio',
    description: 'Apps, agents, and tools built to solve problems I care about.',
  },
  engineering: {
    label: 'Hardware & robotics',
    title: 'Engineering portfolio',
    description: 'Physical interfaces and systems where code meets the real world.',
  },
  photography: {
    label: 'Through the lens',
    title: 'Photography portfolio',
    description: 'A place for the people, places, and details that catch my eye.',
  },
};

function Project({ project, number }) {
  const [expanded, setExpanded] = React.useState(false);
  const detailsId = `project-${project.slug}-details`;
  const hasMore = Boolean(project.details?.length || project.highlights?.length || project.gallery?.length || project.video);
  const galleryGroups = new Map();
  for (const image of project.gallery || []) {
    const group = image.group || '';
    galleryGroups.set(group, [...(galleryGroups.get(group) || []), image]);
  }

  return (
    <article className="project" id={project.slug}>
      <div className="project__layout">
        <div className="project__media">
          <div className={`project__image-frame${project.video?.embedUrl ? ' project__image-frame--video' : ''}`}>
            {project.video?.embedUrl ? (
              <iframe src={project.video.embedUrl} title={project.video.title || `${project.title} demo`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            ) : (
              <a className="project__image-link" href={project.cover.src} target="_blank" rel="noopener noreferrer" aria-label={`Open image: ${project.cover.alt}`}>
                <img className="project__image" src={project.cover.src} alt={project.cover.alt} loading="lazy" />
              </a>
            )}
          </div>
          {hasMore && (
            <button
              className="project__more-button"
              type="button"
              aria-expanded={expanded}
              aria-controls={detailsId}
              onClick={() => setExpanded(value => !value)}
            >
              <span>{expanded ? 'Show less' : 'See more'}</span>
              <span aria-hidden="true">{expanded ? '↑' : '↗'}</span>
            </button>
          )}
        </div>
        <div className="project__body">
          <div className="project__topline"><span className="project__number">{String(number).padStart(2, '0')}</span><span>{project.type}</span><span>{project.year}</span></div>
          <h3>{project.title}</h3>
          <p className="project__description">{project.description}</p>
          {project.tools?.length > 0 && <ul className="project__tools" aria-label="Tools used">{project.tools.map(tool => <li key={tool}>{tool}</li>)}</ul>}
          {(project.video?.url || project.links?.length > 0) && (
            <div className="project__links">
              {project.video?.url && <a href={project.video.url} target="_blank" rel="noopener noreferrer"><FaYoutube size={17} aria-hidden="true" /> Watch demo <span aria-hidden="true">↗</span></a>}
              {(project.links || []).map(link => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{link.label === 'GitHub' ? <FaGithub size={17} aria-hidden="true" /> : link.label === 'Website' ? <FaGlobe size={17} aria-hidden="true" /> : null}{link.label} <span aria-hidden="true">↗</span></a>)}
            </div>
          )}
        </div>
      </div>
      {hasMore && (
        <div className="project__expanded" id={detailsId} hidden={!expanded}>
          <div className="project__expanded-intro">
            {project.details?.length > 0 && (
              <div className="project__notes">
                <h4>A closer look</h4>
                {project.details.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
              </div>
            )}
            {project.highlights?.length > 0 && (
              <div className="project__highlights">
                <h4>Inside the project</h4>
                <ul>{project.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}</ul>
              </div>
            )}
          </div>
          {project.gallery?.length > 0 && (
            <div className="project__gallery" aria-label={`${project.title} gallery`}>
              {[...galleryGroups].map(([group, images]) => (
                <div className="project__gallery-group" key={group}>
                  {group && <h5>{group}</h5>}
                  <div className={`project__gallery-grid${images.every(image => image.orientation === 'portrait') ? ' project__gallery-grid--portrait' : images.every(image => image.orientation === 'wide') ? ' project__gallery-grid--wide' : ''}`}>
                    {images.map(image => (
                      <figure key={image.src}>
                        <a href={image.src} target="_blank" rel="noopener noreferrer" aria-label={`Open image: ${image.caption || image.alt}`}>
                          <img src={image.src} alt={image.alt} loading="lazy" />
                        </a>
                        {image.caption && <figcaption>{image.caption}</figcaption>}
                      </figure>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function Header({ onHome = false }) {
  const home = onHome ? '' : '/';
  return (
    <header className="site-header page-width">
      <a className="site-header__name" href="/">Nirvaan Kohli</a>
      <nav aria-label="Main navigation">
        <a href={`${home}#about`}>About</a>
        <a href={`${home}#experience`}>Experience</a>
        <a href={`${home}#portfolios`}>Portfolios</a>
        <a href="https://blog.nirvaankohli.com/" target="_blank" rel="noopener noreferrer">Blog <span aria-hidden="true">↗</span></a>
        <a href="/Nirvaan_Kohli_Resume.pdf" target="_blank" rel="noopener noreferrer">Resume <span aria-hidden="true">↗</span></a>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer" id="contact">
      <div className="site-footer__content page-width">
        <p>Thanks for stopping by.</p>
        <div><a href="mailto:hello@nirvaankohli.com">Email</a><a href="https://github.com/nirvaankohli" target="_blank" rel="noopener noreferrer">GitHub</a><a href="https://blog.nirvaankohli.com/" target="_blank" rel="noopener noreferrer">Blog</a></div>
        <small>© {new Date().getFullYear()} Nirvaan Kohli</small>
      </div>
    </footer>
  );
}

function PointerEffects() {
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setEnabled(finePointer.matches && !reducedMotion.matches);
    update();
    finePointer.addEventListener('change', update);
    reducedMotion.addEventListener('change', update);
    return () => {
      finePointer.removeEventListener('change', update);
      reducedMotion.removeEventListener('change', update);
    };
  }, []);

  return enabled ? (
    <React.Suspense fallback={null}>
      <BlobCursor
        material="jelly"
        color="#797f86"
        blend="normal"
        size={38}
        morph={0}
        morphSpeed={0.05}
        depth={1}
        trail={0}
        lag={0}
        goo={1}
        stretch={0}
        wobble={0}
        drip={0}
        shine={1}
        splash
        splashCount={6}
        splashSpeed={0.5}
        splashSize={0.5}
        splashGravity={0}
        regrow={0.5}
        shadow={false}
        hideCursor
      />
    </React.Suspense>
  ) : null;
}

function PortfolioPage({ kind }) {
  const portfolio = portfolios[kind];
  const entries = projects.filter(project => project.portfolio === kind);
  document.title = `${portfolio.title} | Nirvaan Kohli`;

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <PointerEffects />
      <Header />
      <main id="main" className="portfolio-page">
        <section className="portfolio-page__intro page-width">
          <a className="portfolio-page__back" href="/#portfolios">← Back to portfolios</a>
          <p className="portfolio-page__label">{portfolio.label}</p>
          <h1>{portfolio.title}</h1>
          <p className="portfolio-page__description">{portfolio.description}</p>
        </section>
        <section className="portfolio-page__work page-width" aria-label={`${portfolio.title} work`}>
          {entries.length > 0 ? (
            <div className="projects">{entries.map((project, index) => <Project key={project.slug} project={project} number={index + 1} />)}</div>
          ) : (
            <p className="portfolio-page__empty">I’m putting together the first set of photographs for this page.</p>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

function App() {
  React.useLayoutEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) document.getElementById(id)?.scrollIntoView();
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <PointerEffects />
      <Header onHome />

      <main id="main">
        <section className="intro" id="top" aria-labelledby="intro-title">
          <div className="intro__rays" aria-hidden="true">
            <LightRays
              raysOrigin="top-center"
              raysColor="#aebaff"
              raysSpeed={0.4}
              lightSpread={0.62}
              rayLength={2.1}
              rayDensity={1.05}
              raySharpness={0.3}
              glow={0.7}
              haze={0.22}
              atmosphere={0.75}
              intensity={1.1}
              followMouse
              mouseInfluence={0.08}
              cursorShadow={false}
              clickPulse={false}
              opacity={0.9}
              maxDevicePixelRatio={1.5}
            />
          </div>
          <div className="intro__veil" aria-hidden="true" />
          <div className="intro__copy page-width">
            <WarmTooltipGroup delay={350} warmWindow={450}>
              <div className="socials" aria-label="Social links">
                <WarmTooltip content="LinkedIn" surfaceColor="#dce2ff" inkColor="#101522" side="top">
                  <a href="https://www.linkedin.com/in/nirvaan-kohli-61bbb5402" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile"><FaLinkedinIn size={19} aria-hidden="true" /></a>
                </WarmTooltip>
                <WarmTooltip content="GitHub" surfaceColor="#dce2ff" inkColor="#101522" side="top">
                  <a href="https://github.com/nirvaankohli" target="_blank" rel="noopener noreferrer" aria-label="GitHub profile"><FaGithub size={20} aria-hidden="true" /></a>
                </WarmTooltip>
                <WarmTooltip content="Email" surfaceColor="#dce2ff" inkColor="#101522" side="top">
                  <a href="mailto:hello@nirvaankohli.com" aria-label="Email Nirvaan"><FaEnvelope size={19} aria-hidden="true" /></a>
                </WarmTooltip>
              </div>
            </WarmTooltipGroup>
            <p className="intro__hello">Hi, I’m</p>
            <h1 id="intro-title">Nirvaan Kohli<span>.</span></h1>
            <p className="intro__description">A home for the things I’ve built, researched, and photographed.</p>
            <a className="intro__explore" href="#about">A little about me <FaArrowDownLong size={15} aria-hidden="true" /></a>
          </div>
        </section>

        <section className="about page-width" id="about" aria-labelledby="about-title">
          <div className="about__intro">
            <h2 id="about-title">I’m a high school developer who enjoys building <span>software</span> and <span>hardware</span>, and exploring <span>photography</span>.</h2>
            <p>I make apps and robotics tools, study safer ways to steer AI, and teach programming. I also help other students make things and keep a camera close by.</p>
          </div>
          <div className="about__skills" aria-labelledby="skills-title">
            <h3 id="skills-title">What I work with</h3>
            <dl>
              {skills.map(({ label, items }) => (
                <div key={label}><dt>{label}</dt><dd>{items}</dd></div>
              ))}
            </dl>
          </div>
        </section>

        <section className="experience page-width" id="experience" aria-labelledby="experience-title">
          <div className="section-heading">
            <ScrollFloat id="experience-title" ease="power3.out" stagger={0.025} distance={70} stretch={1.25} scrollStart="top bottom" scrollEnd="bottom 65%">Things I’ve done</ScrollFloat>
            <p>Where I’ve built, taught, and helped bring people together.</p>
          </div>
          <div className="experience-list">
            {experience.map(({ category, role, organization, detail }, index) => (
              <details className="experience-row" name="experience" key={category}>
                <summary className="experience-row__summary">
                  <span className="experience-row__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <span className="experience-row__category">{category}</span>
                  <span className="experience-row__title">{role} <span>@ {organization}</span></span>
                  <span className="experience-row__toggle" aria-hidden="true">+</span>
                </summary>
                <div className="experience-row__details"><p>{detail}</p></div>
              </details>
            ))}
          </div>
        </section>

        <section className="portfolios page-width" id="portfolios" aria-labelledby="portfolios-title">
          <div className="section-heading">
            <ScrollFloat id="portfolios-title" ease="power3.out" stagger={0.025} distance={70} stretch={1.25} scrollStart="top bottom" scrollEnd="bottom 65%">Explore my work</ScrollFloat>
            <p>Software, physical projects, and photographs.</p>
          </div>
          <div className="portfolio-links">
            {Object.entries(portfolios).map(([kind, portfolio]) => (
              <a className={`portfolio-link portfolio-link--${kind}`} href={`/${kind}/`} key={kind}>
                <span className="portfolio-link__label">{portfolio.label}</span>
                <span className="portfolio-link__title">{portfolio.title}</span>
                <span className="portfolio-link__arrow" aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </section>

        <section className="writing page-width" aria-labelledby="writing-title">
          <div><h2 id="writing-title">Writing</h2><p>Thoughts, stories, and ideas live on my blog.</p></div>
          <a href="https://blog.nirvaankohli.com/" target="_blank" rel="noopener noreferrer">Visit the blog <span aria-hidden="true">↗</span></a>
        </section>
      </main>

      <Footer />
    </>
  );
}

const route = window.location.pathname.replace(/\/+$/, '');
createRoot(document.getElementById('root')).render(portfolios[route.slice(1)] ? <PortfolioPage kind={route.slice(1)} /> : <App />);
