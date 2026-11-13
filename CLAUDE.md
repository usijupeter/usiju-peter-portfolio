# CLAUDE.md — context for AI coding agents

Personal portfolio for **Usiju Peter** (creative developer). Live at https://usijupeter.vercel.app.
Read `docs/HANDOFF.md` for accounts, history and the open to-do list before making changes.

## Stack (current)
- **Vite 6 + Preact 10** (React-style components via `preact/compat` aliases in `vite.config.ts`) + TypeScript.
- **Build-time prerender**: `src/entry-server.tsx` renders every route to static HTML (`scripts/prerender.mjs`), the client hydrates (`src/main.tsx`). Routes: `/` and `/work/<slug>` per project.
- Plain CSS, one file: `src/styles.css`. All colours/radii/type sizes are tokens at the top (light in `:root`, dark in `:root.dark`).
- Self-hosted fonts in `public/fonts/` (Manrope, Montserrat, DM Mono — Latin subsets, preloaded in `index.html`).
- Images: source PNGs in `assets-src/`, `npm run images` (sharp) writes WebP/AVIF to `public/`.
- Hosting: Vercel (static). `vercel.json` holds CSP/security headers, caching, redirects.

## Commands
```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # tsc + vite build + SSR build + prerender -> dist/
npm run preview   # serve dist/ at http://localhost:4173
npm run images    # regenerate responsive images from assets-src/
```

## Rules that keep the site fast and accessible (verified Lighthouse mobile 99–100, a11y 100)
- Content lives in `src/data.ts`. Never invent client results, testimonials or metrics — ask the owner.
- Keep text contrast ≥ 4.5:1 (the `--accent` / `--subtle` tokens were tuned for this; re-measure if changed).
- `h1` must stay the largest heading at every width (`--h1` > `--h2`).
- Don't animate `opacity` on above-the-fold hero content (it delays LCP); transform-only entrances.
- Minimum text 12px, touch targets ≥ 44px where possible (never < 24px), form inputs 16px (no iOS zoom).
- No new runtime dependencies without a reason; check bundle size after `npm run build`.
- If you add an external service (forms, embeds, analytics), update the CSP in `vercel.json` or it will be blocked.
- After visual changes, check 320 / 390 / 768 / 1024 / 1440 widths in light and dark, with real (not reduced) motion.

## Planned direction
Owner prefers **Next.js** and plans to add a **blog**, **more projects**, and **server-side email** (Resend).
The agreed plan is in `docs/HANDOFF.md` → "Next step: migrate to Next.js".

## Git / deploy
- `origin` = github.com/usijupeter/usiju-peter-portfolio (owner's fork); `upstream` = pbona01/usiju-peter-portfolio (read-only).
- Deploy: `vercel deploy --prod` (Vercel project `usijupeter`). Git auto-deploy is not connected yet — see HANDOFF.
