import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// Preact (via preact/compat) renders the same React components at a fraction of React's size.
export default defineConfig({
  plugins: [preact({ prerender: { enabled: false } })],
  resolve: { alias: { react: 'preact/compat', 'react-dom': 'preact/compat', 'react/jsx-runtime': 'preact/jsx-runtime' } },
  ssr: { noExternal: ['lucide-react'] },
});
