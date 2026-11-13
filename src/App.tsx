import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowUpRight, Download, FileText, Menu, Moon, Sun, X } from 'lucide-react';
import { projects, site } from './data';

const links = [['Work', 'work'], ['About', 'about'], ['Contact', 'contact']] as const;

function Btn({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} className="btn">{children}<ArrowUpRight size={16} aria-hidden="true" /></a>;
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

function useTheme() {
  // Server render and first client render both start "light"; the real value is synced after hydration.
  // theme.js has already applied the correct class before paint, so there is no flash.
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains('dark')); }, []);
  const toggle = () => {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch { /* storage unavailable */ }
    document.querySelector('meta[name="theme-color"]:not([media])')?.setAttribute('content', next ? '#0d1520' : '#f7fbff');
    setDark(next);
  };
  return [dark, toggle] as const;
}

function Nav() {
  const [open, setOpen] = useState(false);
  const [dark, toggleTheme] = useTheme();
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);

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
      <a className="brand" href="#top" aria-label="Usiju Peter — back to top">Usiju<span>.</span></a>
      <nav aria-label="Main">{links.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav>
      <div className="navActions">
        <button type="button" className="themeToggle" onClick={toggleTheme} aria-label={themeLabel} title={themeLabel}>{dark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}</button>
        <a className="textLink" href={site.cv} target="_blank" rel="noopener">CV <Download size={14} aria-hidden="true" /></a>
        <Btn href="#contact">Contact</Btn>
      </div>
      <button type="button" className="menuBtn" ref={opener} onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} aria-controls="mobile-menu"><Menu aria-hidden="true" /></button>
    </header>
    <div id="mobile-menu" ref={panel} className={`mobileMenu glass ${open ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu" hidden={!open}>
      <button type="button" className="closeBtn" onClick={() => setOpen(false)} aria-label="Close menu"><X aria-hidden="true" /></button>
      {links.map(([label, id]) => <a key={id} className="mobileLink" href={`#${id}`} onClick={() => setOpen(false)}>{label}<ArrowUpRight aria-hidden="true" /></a>)}
      <a className="mobileRow" href={site.cv} target="_blank" rel="noopener">View CV <Download size={16} aria-hidden="true" /></a>
      <button type="button" className="mobileRow" onClick={toggleTheme}>{dark ? 'Light mode' : 'Dark mode'} {dark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}</button>
    </div>
  </>;
}

function Hero() {
  return <section className="hero" aria-labelledby="hero-title">
    <div className="heroPhoto">
      <picture>
        <source type="image/avif" srcSet="/images/usiju-peter-480.avif 480w, /images/usiju-peter-900.avif 900w" sizes="(max-width: 760px) 72vw, 420px" />
        <img src="/images/usiju-peter-900.webp" srcSet="/images/usiju-peter-480.webp 480w, /images/usiju-peter-900.webp 900w" sizes="(max-width: 760px) 72vw, 420px" alt="Portrait of Usiju Peter" width="900" height="900" fetchPriority="high" />
      </picture>
    </div>
    <div className="heroCopy">
      <h1 id="hero-title">Usiju Peter<span>Creative Developer</span></h1>
      <p>{site.intro}</p>
      <div className="actions">
        <Btn href="#contact">Start a Conversation</Btn>
        <a className="textLink underline" href={site.cv} target="_blank" rel="noopener"><FileText size={16} aria-hidden="true" /> View CV</a>
      </div>
    </div>
    <a className="scrollHint" href="#work">Scroll to explore <ArrowDown size={15} aria-hidden="true" /></a>
  </section>;
}

function Work() {
  return <section id="work" className="section work" aria-labelledby="work-title">
    <Reveal><Label>01 / SELECTED WORK</Label><h2 id="work-title">Selected Projects</h2></Reveal>
    <ul className="workTiles" role="list">{projects.map((p, i) => <li key={p.slug}><Reveal delay={i * 0.08}>
      <a className="project" href={p.live} target="_blank" rel="noopener" aria-label={`${p.title} — view live website (opens in a new tab)`}>
        <div className="projectPreview">
          <img src={`/projects/${p.image}-640.webp`} srcSet={`/projects/${p.image}-640.webp 640w, /projects/${p.image}-1280.webp 1280w`} sizes="(max-width: 700px) calc(100vw - 48px), (max-width: 980px) 45vw, 360px" alt={`Homepage of the ${p.title} website`} width="1280" height="889" loading="lazy" decoding="async" />
        </div>
        <div className="projectInfo">
          <h3>{p.title}</h3>
          <span className="projectCat">{p.category}</span>
          <span className="projectHover" aria-hidden="true">View Project <ArrowUpRight size={16} /></span>
          <p>{p.description}</p>
        </div>
      </a>
    </Reveal></li>)}</ul>
  </section>;
}

function About() {
  return <section id="about" className="section about" aria-labelledby="about-title">
    <div className="inner">
      <Reveal><Label>02 / ABOUT ME</Label></Reveal>
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

type Status = { kind: 'idle' | 'sending' | 'ok' | 'error'; text: string };

function Contact() {
  const [status, setStatus] = useState<Status>({ kind: 'idle', text: '' });
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    if (data._honey) return; // spam bot
    if (!site.email) { setStatus({ kind: 'error', text: 'The contact form isn’t connected yet — please reach out on LinkedIn or X for now.' }); return; }
    setStatus({ kind: 'sending', text: 'Sending…' });
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${site.email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, message: data.message, _subject: `Portfolio enquiry from ${data.name}`, _replyto: data.email, _template: 'table', _captcha: 'false' }),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setStatus({ kind: 'ok', text: 'Thanks — your message is on its way. I’ll reply soon.' });
    } catch {
      setStatus({ kind: 'error', text: `Something went wrong sending your message. You can email me directly at ${site.email}.` });
    }
  };
  return <section id="contact" className="contact" aria-labelledby="contact-title"><Reveal><div className="contactBox glass">
    <div>
      <Label>03 / CONTACT</Label>
      <h2 id="contact-title">Start a conversation.</h2>
      <p>Have a project, idea, or opportunity in mind? Send a note and let’s make it happen.</p>
      <div className="contactLinks">
        {site.email && <a className="textLink" href={`mailto:${site.email}`}>{site.email}</a>}
        <a className="textLink" href={site.cv} target="_blank" rel="noopener"><FileText size={16} aria-hidden="true" /> View CV</a>
      </div>
    </div>
    <form className="contactForm" onSubmit={submit}>
      <label>Name<input name="name" autoComplete="name" required maxLength={100} placeholder="Your name" /></label>
      <label>Email<input name="email" type="email" autoComplete="email" required maxLength={150} placeholder="you@email.com" /></label>
      <label>Message<textarea name="message" required maxLength={5000} placeholder="Tell me about your project" rows={4} /></label>
      <input type="text" name="_honey" className="honey" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button type="submit" className="btn" disabled={status.kind === 'sending'}>{status.kind === 'sending' ? 'Sending…' : 'Send message'} <ArrowUpRight size={16} aria-hidden="true" /></button>
      <p className={`formNotice ${status.kind}`} role="status" aria-live="polite">{status.text}</p>
    </form>
  </div></Reveal></section>;
}

function Footer() {
  return <footer className="footer">
    <div><p className="footerName">Usiju Peter</p><p className="footerTagline">Digital ideas, made clear.</p></div>
    <nav aria-label="Footer">
      {links.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}
      <a href={site.socials.linkedin} target="_blank" rel="noopener me">LinkedIn</a>
      <a href={site.socials.x} target="_blank" rel="noopener me">X</a>
    </nav>
    <small>© <span suppressHydrationWarning>{new Date().getFullYear()}</span> Usiju Peter. All rights reserved.</small>
  </footer>;
}

export function App() {
  useReveal();
  return <>
    <a className="skipLink" href="#main">Skip to content</a>
    <Nav />
    <main id="main" tabIndex={-1}><Hero /><Work /><About /><Contact /></main>
    <Footer />
  </>;
}
