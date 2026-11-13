# Usiju Peter — Portfolio

Personal portfolio built with Vite + React 19, pre-rendered to static HTML at build time and deployed on Vercel.

```bash
npm install
npm run dev       # local dev server (http://localhost:5173)
npm run build     # type-check, build, and pre-render into dist/
npm run preview   # serve the production build
npm run images    # regenerate responsive WebP/AVIF from assets-src/*.png
```

## Where things live

| What | Where |
| --- | --- |
| Text, projects, links, contact email | `src/data.ts` |
| Page components | `src/App.tsx` |
| All styles (light + dark tokens at the top) | `src/styles.css` |
| SEO meta, Open Graph, JSON-LD | `index.html` |
| Security + cache headers, redirects | `vercel.json` |
| Source images (not deployed) | `assets-src/` |

## Adding a project

1. Drop a 1440×1000 PNG screenshot in `assets-src/projects/<slug>.png`.
2. Run `npm run images`.
3. Add an entry to `projects` in `src/data.ts` with `image: '<slug>'`.

## Contact form

Messages are sent through [FormSubmit](https://formsubmit.co). Set `email` in `src/data.ts`, deploy, submit the form once, and click the activation link FormSubmit emails you.

## Changing the domain

Replace `https://usijupeter.vercel.app` in `src/data.ts`, `index.html`, `public/robots.txt` and `public/sitemap.xml`.
