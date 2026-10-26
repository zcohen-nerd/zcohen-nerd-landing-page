#!/usr/bin/env node
/**
 * Reject every unapproved npm advisory, at every severity.
 * Exceptions match advisory IDs AND exact installed versions and expire.
 * Invalid reports, lockfiles, exceptions, and registry failures fail closed.
 */
import {existsSync, readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

const ALLOWLIST_PATH = '.github/audit-allowlist.json';
const severities = ['info', 'low', 'moderate', 'high', 'critical'];
const ghsa =
  /^GHSA-[23456789cfghjmpqrvwx]{4}-[23456789cfghjmpqrvwx]{4}-[23456789cfghjmpqrvwx]{4}$/;
const object = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const nonempty = (value) => typeof value === 'string' && value.trim() !== '';

try {
  let raw = process.stdin.isTTY ? '' : readFileSync(0, 'utf8').trim();
  if (!raw) {
    const result = spawnSync('npm', ['audit', '--json'], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      timeout: 120_000,
    });
    if (result.error) throw result.error;
    if (result.signal || ![0, 1].includes(result.status)) {
      throw new Error(`npm audit failed (${result.signal || result.status})`);
    }
    raw = result.stdout;
  }
  const audit = JSON.parse(raw);
  const counts = audit.metadata?.vulnerabilities;
  if (
    audit.error ||
    !object(audit.vulnerabilities) ||
    !object(counts) ||
    !['total', ...severities.filter((key) => key !== 'info')].every(
      (key) => Number.isInteger(counts[key]) && counts[key] >= 0,
    ) ||
    (counts.info !== undefined &&
      (!Number.isInteger(counts.info) || counts.info < 0))
  ) {
    throw new Error('npm audit did not return a valid vulnerability report');
  }
  const entries = Object.entries(audit.vulnerabilities);
  if (
    entries.length !== counts.total ||
    severities.reduce((sum, key) => sum + (counts[key] || 0), 0) !==
      counts.total
  ) {
    throw new Error('npm audit returned inconsistent vulnerability counts');
  }

  const roots = new Map();
  for (const [name, info] of entries) {
    if (
      !object(info) ||
      !severities.includes(info.severity) ||
      !Array.isArray(info.via) ||
      info.via.length === 0 ||
      !Array.isArray(info.nodes) ||
      info.nodes.length === 0 ||
      !info.nodes.every(nonempty)
    ) {
      throw new Error(`Invalid advisory entry: ${name}`);
    }
    const ids = [];
    for (const via of info.via) {
      if (typeof via === 'string') {
        if (!Object.hasOwn(audit.vulnerabilities, via)) {
          throw new Error(`Missing advisory source: ${name} -> ${via}`);
        }
      } else if (object(via)) {
        const id = via.url?.match(
          /^https:\/\/github\.com\/advisories\/(GHSA-[^/]+)$/,
        )?.[1];
        if (!id || !ghsa.test(id)) {
          throw new Error(`Missing or invalid advisory ID: ${name}`);
        }
        ids.push(id);
      } else {
        throw new Error(`Invalid advisory source: ${name}`);
      }
    }
    if (ids.length > 0) roots.set(name, [...new Set(ids)]);
  }
  // Cascade-only entries must lead to an actual advisory, not a cycle or an
  // empty report. Count each advisory at its root package rather than every
  // affected parent in npm's dependency chain.
  function reachesRoot(name, visiting = new Set()) {
    if (roots.has(name)) return true;
    if (visiting.has(name)) return false;
    const next = new Set([...visiting, name]);
    return audit.vulnerabilities[name].via.some((via) =>
      typeof via === 'string' ? reachesRoot(via, next) : false,
    );
  }
  if (entries.some(([name]) => !reachesRoot(name))) {
    throw new Error('Audit report contains an advisory chain with no root');
  }

  const allowlist = existsSync(ALLOWLIST_PATH)
    ? JSON.parse(readFileSync(ALLOWLIST_PATH, 'utf8'))
    : {advisories: []};
  if (!object(allowlist) || !Array.isArray(allowlist.advisories)) {
    throw new Error('Invalid audit allowlist');
  }
  const today = new Date().toISOString().slice(0, 10);
  const exceptions = new Map();
  for (const entry of allowlist.advisories) {
    if (
      !object(entry) ||
      !nonempty(entry.package) ||
      exceptions.has(entry.package) ||
      !severities.includes(entry.severity) ||
      !Array.isArray(entry.advisories) ||
      entry.advisories.length === 0 ||
      !entry.advisories.every(
        (id) => typeof id === 'string' && ghsa.test(id),
      ) ||
      !Array.isArray(entry.versions) ||
      entry.versions.length === 0 ||
      !entry.versions.every((version) =>
        /^\d+\.\d+\.\d+(?:[-+][\w.+-]+)?$/.test(version),
      ) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(entry.review_by) ||
      new Date(`${entry.review_by}T00:00:00Z`).toISOString().slice(0, 10) !==
        entry.review_by ||
      !['reason', 'path', 'upstream'].every((key) => nonempty(entry[key]))
    ) {
      throw new Error('Invalid or duplicate audit exception');
    }
    if (entry.review_by < today) {
      throw new Error(
        `Expired exception: ${entry.package} (${entry.review_by})`,
      );
    }
    exceptions.set(entry.package, entry);
  }
  const lock = exceptions.size
    ? JSON.parse(readFileSync('package-lock.json', 'utf8'))
    : {packages: {}};
  if (!object(lock.packages)) throw new Error('Invalid package lockfile');

  console.log(
    `npm audit: ${counts.critical} critical, ${counts.high} high, ${counts.moderate} moderate, ${counts.low} low`,
  );
  const blockers = [];
  for (const [name, ids] of roots) {
    const info = audit.vulnerabilities[name];
    const exception = exceptions.get(name);
    const approved =
      exception &&
      exception.severity === info.severity &&
      ids.every((id) => exception.advisories.includes(id)) &&
      info.nodes.every((path) =>
        exception.versions.includes(lock.packages[path]?.version),
      );
    console.log(
      `  ${name}: ${info.severity} (${ids.join(', ')})${approved ? ` [exception through ${exception.review_by}]` : ''}`,
    );
    if (!approved) blockers.push(name);
  }
  if (blockers.length > 0) {
    throw new Error(`Unapproved advisories: ${blockers.join(', ')}`);
  }
  console.log(
    counts.total === 0
      ? 'PASS — no known dependency vulnerabilities.'
      : 'PASS — only exact, version-bound, unexpired exceptions remain.',
  );
} catch (error) {
  console.error(`Dependency audit failed: ${error.message}`);
  process.exitCode = 1;
}
