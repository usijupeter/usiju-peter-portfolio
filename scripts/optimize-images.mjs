// Re-encode source PNGs (kept out of the deployed site in /assets-src) into responsive WebP/AVIF.
// Run after adding or replacing an image: npm run images
import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';

const jobs = [
  { dir: 'projects', widths: [640, 1280], formats: ['webp'] },
  { dir: 'images', widths: [480, 900], formats: ['webp', 'avif'] },
];
for (const { dir, widths, formats } of jobs) {
  await mkdir(`public/${dir}`, { recursive: true });
  for (const file of (await readdir(`assets-src/${dir}`)).filter(f => f.endsWith('.png'))) {
    const name = file.replace(/\.png$/, '');
    for (const w of widths) for (const fmt of formats) {
      const out = `public/${dir}/${name}-${w}.${fmt}`;
      await sharp(`assets-src/${dir}/${file}`).resize({ width: w, withoutEnlargement: true })[fmt](fmt === 'avif' ? { quality: 55 } : { quality: 80 }).toFile(out);
      console.log(out);
    }
  }
}
