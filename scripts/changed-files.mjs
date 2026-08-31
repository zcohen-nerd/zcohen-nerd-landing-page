#!/usr/bin/env node
/**
 * List the files changed on this branch (or run a command against them).
 *
 * Used by `npm run format:check` and the pre-commit hook so formatting/lint gates
 * only touch what a change actually modified — never a whole-repo sweep. The
 * one-time baseline reformat is a separate, deliberate `npm run format` commit
 * (see CONTRIBUTING.md), not something CI does implicitly.
 *
 * Change set:
 *   - CI pull request (GITHUB_BASE_REF set): merge-base(origin/<base>, HEAD)..HEAD
 *   - otherwise: working-tree + staged + untracked vs HEAD
 *
 * Usage:
 *   node scripts/changed-files.mjs [--ext .js,.md,...] [--run "prettier --check"]
 *
 *   --ext   comma-separated extension allow-list (default: common source types)
 *   --run   npx-run this command with the file list appended; exit with its code.
 *           With no --run, prints one path per line (empty output = nothing to do).
 */
import {execFileSync, spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';

const args = process.argv.slice(2);
const getOpt = (name) => {
  const i = args.indexOf(name);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
};

const DEFAULT_EXTS =
  '.js,.jsx,.mjs,.cjs,.ts,.tsx,.json,.jsonc,.css,.md,.mdx,.yml,.yaml';
const exts = (getOpt('--ext') || DEFAULT_EXTS)
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);
const runCmd = getOpt('--run');

const git = (argv) => {
  try {
    return execFileSync('git', argv, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return '';
  }
};

let files = [];
const baseRef = process.env.GITHUB_BASE_REF;
if (process.env.CI && baseRef) {
  // Shallow CI checkouts often lack the base branch — fetch just its tip.
  git(['fetch', '--no-tags', '--depth=50', 'origin', baseRef]);
  const mergeBase = git(['merge-base', `origin/${baseRef}`, 'HEAD']).trim();
  const range = mergeBase ? `${mergeBase}..HEAD` : 'HEAD';
  files = git(['diff', '--name-only', '--diff-filter=d', range])
    .split('\n')
    .filter(Boolean);
} else {
  const sets = [
    git(['diff', '--name-only', '--diff-filter=d', 'HEAD']),
    git(['diff', '--name-only', '--diff-filter=d', '--cached']),
    git(['ls-files', '--others', '--exclude-standard']),
  ];
  files = [...new Set(sets.join('\n').split('\n').filter(Boolean))];
}

files = files
  .filter((f) => exts.some((e) => f.toLowerCase().endsWith(e)))
  .filter((f) => existsSync(f));

if (!runCmd) {
  if (files.length) process.stdout.write(files.join('\n') + '\n');
  process.exit(0);
}

if (files.length === 0) {
  console.log(`changed-files: nothing to check for \`${runCmd}\``);
  process.exit(0);
}

// shell:true so a local .bin/.cmd shim resolves on Windows and POSIX alike.
const quoted = files.map((f) => JSON.stringify(f)).join(' ');
const res = spawnSync(`npx --no-install ${runCmd} ${quoted}`, {
  stdio: 'inherit',
  shell: true,
});
if (res.error) {
  console.error(res.error.message);
  process.exit(1);
}
process.exit(res.status ?? 1);
