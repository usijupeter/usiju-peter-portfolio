import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowLeft, ArrowUpRight, Download, FileText, Menu, Moon, Sun, X } from 'lucide-react';
import { projects, site, type Project } from './data';

const sections = [['Work', 'work'], ['About', 'about'], ['Contact', 'contact']] as const;

function Btn({ href, children, external = false }: { href: string; children: ReactNode; external?: boolean }) {
  return <a href={href} className="btn" {...(external ? { target: '_blank', rel: 'noopener' } : {})}>{children}<ArrowUpRight size={16} aria-hidden="true" /></a>;
}

function Label({ children }: { children: string }) {
  return <p className="label">{children}</p>;
}

/** Fades content in on scroll. Content is visible by default; the hidden state only applies once JS has run (see theme.js). */
function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return <div className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}s` } : undefined}>{children}</div>;
}

function useReveal() {
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) { items.forEach(el => el.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/** Highlights the nav link for the section currently in view (home page only). */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState('');
  useEffect(() => {
    if (!enabled || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(([, id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    const hero = document.querySelector('.hero');
    const top = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(''); }, { rootMargin: '-45% 0px -50% 0px' });
    if (hero) top.observe(hero);
    return () => { io.disconnect(); top.disconnect(); };
  }, [enabled]);
  return active;
}

function useTheme() {
  // Server render and first client render both start "light"; the real value is synced after hydration.
  // theme.js has already applied the correct class before paint, so there is no flash.
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains('dark')); }, []);
  const toggle = () => {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch { /* storage unavailable */ }
    setDark(next);
  };
  return [dark, toggle] as const;
}

function Nav({ home }: { home: boolean }) {
  const [open, setOpen] = useState(false);
  const [dark, toggleTheme] = useTheme();
  const active = useActiveSection(home);
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const base = home ? '' : '/';

  useEffect(() => {
    if (!open) return;
    document.documentElement.classList.add('menuOpen');
    // Make everything behind the dialog unreachable (works in every browser, incl. Safari's link-skipping Tab order).
    const background = Array.from(document.querySelectorAll<HTMLElement>('.skipLink, header.nav, main, footer'));
    background.forEach(el => { el.inert = true; });
    const root = panel.current!;
    const focusables = () => Array.from(root.querySelectorAll<HTMLElement>('a, button'));
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key !== 'Tab') return;
      const f = focusables(), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      background.forEach(el => { el.inert = false; });
      document.documentElement.classList.remove('menuOpen');
      opener.current?.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 761px)');
    const close = () => mq.matches && setOpen(false);
    mq.addEventListener('change', close);
    return () => mq.removeEventListener('change', close);
  }, []);

  const themeLabel = `Switch to ${dark ? 'light' : 'dark'} mode`;
  return <>
    <header className="nav glass">
      <a className="brand" href={home ? '#top' : '/'} aria-label="Usiju Peter — home">Usiju<span>.</span></a>
      <nav aria-label="Main">{sections.map(([label, id]) => <a key={id} href={`${base}#${id}`} aria-current={active === id ? 'true' : undefined}>{label}</a>)}</nav>
      <div className="navActions">
        <button type="button" className="themeToggle" onClick={toggleTheme} aria-label={themeLabel} title={themeLabel}>{dark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}</button>
        <a className="textLink" href={site.cv} target="_blank" rel="noopener">CV <Download size={14} aria-hidden="true" /></a>
        <Btn href={`${base}#contact`}>Contact</Btn>
      </div>
      <button type="button" className="menuBtn" ref={opener} onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} aria-controls="mobile-menu"><Menu aria-hidden="true" /></button>
    </header>
    <div id="mobile-menu" ref={panel} className={`mobileMenu glass ${open ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu" hidden={!open}>
      <button type="button" className="closeBtn" onClick={() => setOpen(false)} aria-label="Close menu"><X aria-hidden="true" /></button>
      {sections.map(([label, id]) => <a key={id} className="mobileLink" href={`${base}#${id}`} onClick={() => setOpen(false)}>{label}<ArrowUpRight aria-hidden="true" /></a>)}
      <a className="mobileRow" href={site.cv} target="_blank" rel="noopener">View CV <Download size={16} aria-hidden="true" /></a>
      <button type="button" className="mobileRow" onClick={toggleTheme}>{dark ? 'Light mode' : 'Dark mode'} {dark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}</button>
    </div>
  </>;
}

function Hero() {
  return <section className="hero" aria-labelledby="hero-title">
    <div className="heroPhoto">
      <div className="arch">
        <picture>
          <source type="image/avif" srcSet="/images/usiju-peter-480.avif 480w, /images/usiju-peter-900.avif 900w" sizes="(max-width: 760px) 74vw, 404px" />
          <img src="/images/usiju-peter-900.webp" srcSet="/images/usiju-peter-480.webp 480w, /images/usiju-peter-900.webp 900w" sizes="(max-width: 760px) 74vw, 404px" alt="Portrait of Usiju Peter" width="900" height="900" fetchPriority="high" decoding="sync" />
        </picture>
      </div>
    </div>
    <div className="heroCopy">
      <h1 id="hero-title">Usiju Peter</h1>
      <p className="heroRole">{site.role}</p>
      <p className="heroIntro">{site.intro}</p>
      <div className="actions">
        <Btn href="#contact">Start a conversation</Btn>
        <a className="textLink underline" href={site.cv} target="_blank" rel="noopener"><FileText size={16} aria-hidden="true" /> View CV</a>
      </div>
    </div>
    <a className="scrollHint" href="#work">Scroll to explore <ArrowDown size={15} aria-hidden="true" /></a>
  </section>;
}

function ProjectCard({ p, delay }: { p: Project; delay: number }) {
  return <Reveal delay={delay}>
    <a className="project" href={`/work/${p.slug}`}>
      <div className="projectPreview">
        <img src={`/projects/${p.image}-card-640.webp`} srcSet={`/projects/${p.image}-card-640.webp 640w, /projects/${p.image}-card-1280.webp 1280w`} sizes="(max-width: 700px) calc(100vw - 48px), (max-width: 980px) 45vw, 360px" alt={`${p.title} website, hero section`} width="1280" height="900" loading="lazy" decoding="async" />
      </div>
      <div className="projectInfo">
        <h3>{p.title}</h3>
        <span className="projectCat">{p.category}</span>
        <span className="projectHover" aria-hidden="true">Case study <ArrowUpRight size={16} /></span>
        <p>{p.description}</p>
      </div>
    </a>
  </Reveal>;
}

function Work() {
  return <section id="work" className="section work" aria-labelledby="work-title">
    <Reveal><Label>01 / Selected work</Label><h2 id="work-title">Selected projects</h2></Reveal>
    <ul className="workTiles" role="list">{projects.map((p, i) => <li key={p.slug}><ProjectCard p={p} delay={i * 0.08} /></li>)}</ul>
  </section>;
}

function About() {
  return <section id="about" className="section about" aria-labelledby="about-title">
    <div className="inner">
      <Reveal><Label>02 / About me</Label></Reveal>
      <div className="split">
        <Reveal><h2 id="about-title">A little more about the person behind the pixels.</h2></Reveal>
        <Reveal delay={0.1}><div className="copy">
          {site.about.map(t => <p key={t}>{t}</p>)}
          <ul className="pills" aria-label="Skills">{site.skills.map(s => <li key={s}>{s}</li>)}</ul>
        </div></Reveal>
      </div>
    </div>
  </section>;
}

type Field = 'name' | 'email' | 'message';
type Status = { kind: 'idle' | 'sending' | 'ok' | 'error'; text: string };
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function Contact() {
  const [status, setStatus] = useState<Status>({ kind: 'idle', text: '' });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

  const validate = (data: Record<string, string>) => {
    const e: Partial<Record<Field, string>> = {};
    if (!data.name?.trim()) e.name = 'Please enter your name.';
    if (!data.email?.trim()) e.email = 'Please enter your email address.';
    else if (!emailOk(data.email.trim())) e.email = 'Please enter a valid email address, like name@example.com.';
    if (!data.message?.trim()) e.message = 'Please tell me a little about your project.';
    return e;
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (data._honey) return; // spam bot
    const e = validate(data);
    setErrors(e);
    const first = (Object.keys(e) as Field[])[0];
    if (first) { (form.elements.namedItem(first) as HTMLElement | null)?.focus(); setStatus({ kind: 'idle', text: '' }); return; }
    setStatus({ kind: 'sending', text: 'Sending…' });
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${site.email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, message: data.message, _subject: `Portfolio enquiry from ${data.name}`, _replyto: data.email, _template: 'table', _captcha: 'false' }),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setStatus({ kind: 'ok', text: 'Thanks, your message is on its way. I’ll reply soon.' });
    } catch {
      setStatus({ kind: 'error', text: `Your message couldn’t be sent. Please try again, or message me on LinkedIn or X.` });
    }
  };

  const clear = (f: Field) => errors[f] && setErrors(prev => ({ ...prev, [f]: undefined }));
  const fieldProps = (f: Field) => ({
    name: f, id: `f-${f}`, required: true,
    'aria-invalid': errors[f] ? true : undefined,
    'aria-describedby': errors[f] ? `f-${f}-error` : undefined,
    onInput: () => clear(f),
  });
  const err = (f: Field) => errors[f] ? <span className="fieldError" id={`f-${f}-error`}>{errors[f]}</span> : null;

  return <section id="contact" className="contact" aria-labelledby="contact-title"><Reveal><div className="contactBox glass">
    <div>
      <Label>03 / Contact</Label>
      <h2 id="contact-title">Start a conversation.</h2>
      <p>Have a project, idea, or opportunity in mind? Send a note and let’s make it happen.</p>
      {site.email && <div className="contactLinks">
        <a className="textLink" href={site.socials.linkedin} target="_blank" rel="noopener me">LinkedIn</a>
        <a className="textLink" href={site.socials.x} target="_blank" rel="noopener me">X (Twitter)</a>
        <a className="textLink" href={site.cv} target="_blank" rel="noopener"><FileText size={16} aria-hidden="true" /> View CV</a>
      </div>}
    </div>
    {/* Until a delivery address is set in data.ts, show direct routes instead of a form that can't send. */}
    {!site.email ? <div className="contactDirect">
      <p className="label">The quickest ways to reach me</p>
      <a className="directLink" href={site.socials.linkedin} target="_blank" rel="noopener me"><span>Message me on LinkedIn</span><ArrowUpRight aria-hidden="true" /></a>
      <a className="directLink" href={site.socials.x} target="_blank" rel="noopener me"><span>Message me on X (Twitter)</span><ArrowUpRight aria-hidden="true" /></a>
      <a className="directLink" href={site.cv} target="_blank" rel="noopener"><span>View my CV</span><FileText aria-hidden="true" /></a>
    </div> :
    <form className="contactForm" onSubmit={submit} noValidate>
      <label htmlFor="f-name">Name</label>
      <div className="field"><input {...fieldProps('name')} autoComplete="name" maxLength={100} placeholder="Your name" />{err('name')}</div>
      <label htmlFor="f-email">Email</label>
      <div className="field"><input {...fieldProps('email')} type="email" autoComplete="email" maxLength={150} placeholder="you@email.com" />{err('email')}</div>
      <label htmlFor="f-message">Message</label>
      <div className="field"><textarea {...fieldProps('message')} maxLength={5000} placeholder="Tell me about your project" rows={4} />{err('message')}</div>
      <input type="text" name="_honey" className="honey" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button type="submit" className="btn" disabled={status.kind === 'sending'}>{status.kind === 'sending' ? 'Sending…' : 'Send message'} <ArrowUpRight size={16} aria-hidden="true" /></button>
      <p className={`formNotice ${status.kind}`} role="status" aria-live="polite">{status.text}</p>
    </form>}
  </div></Reveal></section>;
}

function CaseStudy({ p }: { p: Project }) {
  const i = projects.indexOf(p);
  const next = projects[(i + 1) % projects.length];
  return <article className="caseStudy" aria-labelledby="case-title">
    <a className="backLink textLink" href="/#work"><ArrowLeft size={16} aria-hidden="true" /> All projects</a>
    <p className="label">{`Case study / ${String(i + 1).padStart(2, '0')}`}</p>
    <h1 id="case-title">{p.title}</h1>
    <p className="caseCat">{p.category}</p>
    <p className="caseLede">{p.description}</p>
    <div className="actions"><Btn href={p.live} external>Visit live site</Btn></div>
    <figure className="caseShot">
      <img src={`/projects/${p.image}-1280.webp`} alt={`${p.title} website homepage`} width="1280" height="889" fetchPriority="high" />
    </figure>
    <section className="caseBody" aria-label="Highlights">
      <h2>What the site focuses on</h2>
      <ul className="highlights">{p.highlights.map((h, n) => <li key={h}><span className="label">{String(n + 1).padStart(2, '0')}</span>{h}</li>)}</ul>
    </section>
    <a className="nextProject" href={`/work/${next.slug}`}>
      <span className="label">Next project</span>
      <span className="nextTitle">{next.title} <ArrowUpRight aria-hidden="true" /></span>
    </a>
  </article>;
}

function Footer({ home }: { home: boolean }) {
  const base = home ? '' : '/';
  return <footer className="footer">
    <div><p className="footerName">Usiju Peter</p><p className="footerTagline">Digital ideas, made clear.</p></div>
    <nav aria-label="Footer">
      {sections.map(([label, id]) => <a key={id} href={`${base}#${id}`}>{label}</a>)}
      <a href={site.socials.linkedin} target="_blank" rel="noopener me">LinkedIn</a>
      <a href={site.socials.x} target="_blank" rel="noopener me">X (Twitter)</a>
    </nav>
    <small>© <span>{new Date().getFullYear()}</span> Usiju Peter. All rights reserved.</small>
  </footer>;
}

export function App({ path = '/' }: { path?: string }) {
  useReveal();
  const slug = path.match(/^\/work\/([^/]+)\/?$/)?.[1];
  const project = slug ? projects.find(p => p.slug === slug) : undefined;
  const home = !project;
  return <>
    <a className="skipLink" href="#main">Skip to content</a>
    <Nav home={home} />
    <main id="main" tabIndex={-1}>{project ? <CaseStudy p={project} /> : <><Hero /><Work /><About /><Contact /></>}</main>
    <Footer home={home} />
  </>;
}
