#!/usr/bin/env node
/**
 * Strict dependency-audit gate. No severity or build-tool exclusions.
 * Accepts an npm audit JSON report on stdin, or runs npm audit itself.
 * Missing/invalid reports and registry errors fail closed.
 */
import {existsSync, readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

const ALLOWLIST_PATH = '.github/audit-allowlist.json';

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
      throw new Error(
        `npm audit failed (${result.signal || result.status}): ${result.stderr}`,
      );
    }
    raw = result.stdout;
  }
  const audit = JSON.parse(raw);
  if (
    audit.error ||
    !audit.vulnerabilities ||
    !Number.isInteger(audit.metadata?.vulnerabilities?.total)
  ) {
    throw new Error('npm audit did not return a valid vulnerability report');
  }
  const counts = audit.metadata.vulnerabilities;
  console.log(
    `npm audit: ${counts.critical} critical, ${counts.high} high, ${counts.moderate} moderate, ${counts.low} low`,
  );
  const entries = Object.entries(audit.vulnerabilities);
  const allowlist = existsSync(ALLOWLIST_PATH)
    ? JSON.parse(readFileSync(ALLOWLIST_PATH, 'utf8')).advisories || []
    : [];
  const allowByPackage = new Map(allowlist.map((item) => [item.package, item]));
  const today = new Date().toISOString().slice(0, 10);
  const blockers = [];
  const expired = [];

  for (const [name, info] of entries) {
    const hasVia = Array.isArray(info.via);
    const advisories = (info.via || []).filter(
      (item) => typeof item === 'object',
    );
    if (hasVia && advisories.length === 0) continue;

    const ids = hasVia
      ? advisories.map(
          (item) => item.url?.split('/').pop() || String(item.source),
        )
      : ['unknown'];
    const exception = allowByPackage.get(name);
    const approvedIds = new Set(exception?.advisories || []);
    const unapprovedIds = ids.filter((id) => !approvedIds.has(id));
    const isExpired = exception?.review_by && exception.review_by < today;

    console.log(
      `  ${name}: ${info.severity} (${ids.join(', ')})${exception ? ' [documented exception]' : ''}`,
    );

    if (isExpired) {
      expired.push(`${name} (review_by ${exception.review_by})`);
    }
    if (!exception || unapprovedIds.length > 0) {
      blockers.push(
        `${name}: ${unapprovedIds.length ? unapprovedIds.join(', ') : ids.join(', ')}`,
      );
    }
  }

  if (expired.length > 0) {
    console.error(`Expired exceptions: ${expired.join('; ')}`);
  }
  if (blockers.length > 0 || expired.length > 0) {
    console.error(`FAIL — unresolved advisories: ${blockers.join('; ')}`);
    process.exitCode = 1;
  } else {
    console.log(
      counts.total === 0
        ? 'PASS — no known dependency vulnerabilities.'
        : 'PASS — remaining advisories are exact, documented exceptions.',
    );
  }
} catch (error) {
  console.error(`Dependency audit failed: ${error.message}`);
  process.exitCode = 1;
}
