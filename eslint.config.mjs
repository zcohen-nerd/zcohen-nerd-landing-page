// Shared ESLint flat config — kept in sync by hand across the four zcohen-nerd
// repos (connector-engineering-field-guide, zcohen-nerd-landing-page, Portfolio,
// zcohen-nerd-brand). Last synced 2026-08-31.
//
// Scope: JS / JSX / MJS / CJS only. The guide repo's small set of `.ts` / `.tsx`
// files is covered by `tsc --strict` (npm run typecheck), so TypeScript is
// intentionally not linted here — keeps the toolchain minimal (no
// typescript-eslint). jsx-a11y runs as a fast static complement to the Playwright
// axe smoke tests.
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default [
  {
    ignores: [
      'build/',
      '.docusaurus/',
      'node_modules/',
      'lib/',
      'coverage/',
      'playwright-report/',
      'test-results/',
      '**/*.min.js',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {...globals.browser, ...globals.node},
      parserOptions: {ecmaFeatures: {jsx: true}},
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    settings: {react: {version: 'detect'}},
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/prop-types': 'off',
      // These two jsx-a11y rules fire on legitimate focus-trap / disclosure /
      // modal-dialog containers (a `role="dialog"` div that owns an onKeyDown for
      // Escape + tab-trapping is correct, not a violation). Keep them visible as
      // warnings; the Playwright + axe smoke suite is the authoritative a11y
      // gate, and any real finding there gets human review before a semantics
      // change (see CONTRIBUTING.md).
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'no-unused-vars': [
        'warn',
        {argsIgnorePattern: '^_', varsIgnorePattern: '^_'},
      ],
      'no-empty': ['error', {allowEmptyCatch: true}],
    },
  },
  {
    // Node context: build scripts, Docusaurus config, e2e specs, unit tests.
    files: [
      '*.{js,mjs,cjs}',
      'scripts/**/*.{js,mjs,cjs}',
      'e2e/**/*.{js,mjs,cjs}',
      'test/**/*.{js,mjs,cjs,jsx}',
      '**/*.config.{js,mjs,cjs}',
    ],
    languageOptions: {globals: {...globals.node}},
    rules: {'no-console': 'off'},
  },
];
