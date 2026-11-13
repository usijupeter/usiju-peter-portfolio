# Handoff — Usiju Peter portfolio

Last updated: 2026-11-13. Everything below is the state of the project when work moved off the borrowed Mac.

## Where everything lives

| Thing | Location |
| --- | --- |
| Live site | https://usijupeter.vercel.app |
| Case studies | `/work/444-premium`, `/work/mykaab`, `/work/ubbcakes` |
| Code (your copy) | https://github.com/usijupeter/usiju-peter-portfolio (`main`) |
| Original repo (read-only for you) | https://github.com/pbona01/usiju-peter-portfolio |
| Vercel project | `usijupeter` under Vercel account `usijup3-4108` |
| Visual / UX audit report | https://claude.ai/artifact/XK8EMz2ykpCXYktadtFwbx (private — share from its Share menu) |
| Old deployment (untouched) | https://usiju-peter-portfolio-ashen.vercel.app |

## Setting up on Windows

1. Install **Node.js 22 LTS or newer** (https://nodejs.org) and **Git for Windows** (https://git-scm.com).
2. Optional but useful: GitHub CLI (`winget install GitHub.cli`) and Vercel CLI (`npm i -g vercel`).
3. Clone and run:
   ```powershell
   git clone https://github.com/usijupeter/usiju-peter-portfolio.git
   cd usiju-peter-portfolio
   npm install
   npm run dev
   ```
   Open http://localhost:5173.
4. Sign in to the tools (one time):
   ```powershell
   gh auth login          # GitHub account: usijupeter
   vercel login           # Vercel account: usijup3-4108
   vercel link --project usijupeter --yes
   ```
5. Deploy manually any time: `vercel deploy --prod`.

All scripts are plain Node, so they run the same on Windows. `.gitattributes` keeps line endings consistent between Mac and Windows.

## What was done (summary)

- Removed the unused Next.js/Cloudflare starter files that were mixed into the original repo.
- Rebuilt for speed: pre-rendered HTML, Preact instead of React (JS 408 KB → 41 KB), WebP/AVIF images (3.6 MB → ~70 KB), self-hosted preloaded fonts, long-term caching.
- SEO: `<h1>`, canonical URLs, Open Graph/Twitter share image, JSON-LD Person schema, robots.txt, sitemap, per-page titles for case studies, IndexNow submission (Bing).
- Accessibility: AA contrast everywhere, skip link, keyboard-safe mobile menu, designed form errors, reduced-motion support, 44px targets.
- Responsive: checked at 320–2560px in Chrome and Safari's engine, light and dark.
- Security headers (CSP, HSTS, etc.) in `vercel.json`. Vercel Web Analytics and Speed Insights enabled.
- Full audit (30 categories) scored 73.6/100 before fixes; nearly every finding fixed afterwards (see report link above).
- Latest Lighthouse (mobile, live): Performance 99–100, Accessibility 100, Best Practices 100, SEO 100.

## Open to-do list

1. ~~**Contact form email**~~ — DONE 2026-11-13: FormSubmit activated for usijup3@gmail.com; `site.email` holds FormSubmit's random alias so the inbox address isn't in the code. Test messages confirmed received. (Will be replaced by Resend in the Next.js move.)
2. **Auto-deploy on push** — Vercel's GitHub connection is linked to a different GitHub account (`12Wfg`), so it can't see the `usijupeter` repo. Fix (browser, ~2 min): Vercel → Account Settings → Authentication → connect GitHub as `usijupeter`; then project `usijupeter` → Settings → Git → connect `usijupeter/usiju-peter-portfolio`.
3. **Google Search Console** — add the site, verify (send the code to be added to `index.html`), submit `/sitemap.xml`.
4. **Content** — for each case study: your role, stack, results, a testimonial. Plus more projects (1440×1000 PNG screenshots → `assets-src/projects/`).
5. **Custom domain** (optional) — buy, add in Vercel, then replace `https://usijupeter.vercel.app` in `src/data.ts`, `index.html`, `public/robots.txt`, `public/sitemap.xml`.

## Next step: migrate to Next.js

Decision: the owner prefers **Next.js**, and the site will grow to include a **blog**, **more projects**, and **server-side email**. Plan:

1. Next.js (App Router, TypeScript), fully static where possible (`generateStaticParams`) so pages stay CDN-served.
2. Port components from `src/App.tsx` and keep `src/styles.css` tokens (as a global stylesheet or CSS Modules). Use `next/font/local` with the files in `public/fonts/`.
3. Content as files: `content/projects/*.mdx` and `content/blog/*.mdx` with typed frontmatter; routes `/work/[slug]` and `/blog/[slug]`; blog index, RSS feed, `app/sitemap.ts`, `app/robots.ts`, per-page metadata and OG images.
4. Email: a Route Handler (`app/api/contact/route.ts`) using **Resend**, with validation, honeypot and rate limiting. Needs a Resend API key stored as a Vercel environment variable (`RESEND_API_KEY`) and the destination address (`CONTACT_TO`). Never commit keys.
5. Performance budget to keep: Lighthouse mobile ≥ 95, CLS 0, minimal client components (menu, theme toggle, contact form only).
6. Re-run the checks listed in `CLAUDE.md` before going live; keep the same URLs (`/`, `/work/<slug>`) so links and SEO carry over.

Needed from the owner to start: recipient email, Resend account/API key, and where blog posts will be written (MDX files in the repo is the default).

**Status:** agreed on 2026-11-13, to be done on the Windows machine.

### Expected effort (agent working session, excluding waiting on content/keys)

| Part | Rough time |
| --- | --- |
| Next.js setup + port pages, styles, fonts, dark mode | 1–1.5 h |
| MDX projects + blog: routes, blog index, RSS, sitemap, OG images | 1–1.5 h |
| Resend contact route with validation and spam protection | 30–45 min |
| Cross-device testing, accessibility, Lighthouse, deploy | ~1 h |

### Expected speed trade-off vs the current Vite + Preact build

Next.js adds roughly 70–90 KB (gzipped) of framework JavaScript. With static generation, content **appears** about as fast as today; the difference is when the page becomes **interactive**:

| Situation | Extra delay before taps respond | Noticeable? |
| --- | --- | --- |
| Modern phone / laptop on Wi-Fi or 4G | < 0.1 s | No |
| Mid-range Android, average mobile data | ~0.2–0.4 s | Barely |
| Budget Android on slow 3G | ~0.5–1 s | Yes, for an immediate tap |

Expected Lighthouse mobile after migration: ~92–97 (currently 99–100). Keep it there by using Server Components by default, client components only for the menu, theme toggle and contact form, `next/font` + `next/image`, static generation for every page, and measuring before each deploy.

## Accounts on the borrowed Mac — sign out before leaving

These logins belong to you and were used on the borrowed Mac. Before handing it back, run in Terminal:
```bash
gh auth logout          # GitHub (usijupeter)
vercel logout           # Vercel (usijup3-4108)
```
Also remove the GitHub entry from Keychain Access (search "github.com") if one exists.
