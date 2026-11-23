import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist', 'dist-ssr', 'node_modules', 'playwright-report', 'test-results'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: { 'react-hooks/rules-of-hooks': 'error', 'react-hooks/exhaustive-deps': 'warn' },
  },
  { files: ['public/**/*.js'], languageOptions: { sourceType: 'script', globals: globals.browser }, rules: { '@typescript-eslint/no-unused-vars': ['error', { caughtErrors: 'none' }] } }, // ES5 for old browsers: no optional catch binding
  { files: ['scripts/**/*.mjs', '*.config.{js,ts}', 'tests/**/*.ts'], languageOptions: { globals: globals.node } },
);
