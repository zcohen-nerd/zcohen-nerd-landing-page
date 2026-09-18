#!/usr/bin/env node
/**
 * Strict dependency-audit gate. No severity or build-tool exclusions.
 * Accepts an npm audit JSON report on stdin, or runs npm audit itself.
 * Missing/invalid reports and registry errors fail closed.
 */
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

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
  for (const [name, info] of entries) {
    console.log(`  ${name}: ${info.severity}`);
  }
  if (counts.total !== 0 || entries.length !== 0) {
    console.error('FAIL — update affected dependencies before merging.');
    process.exitCode = 1;
  } else {
    console.log('PASS — no known dependency vulnerabilities.');
  }
} catch (error) {
  console.error(`Dependency audit failed: ${error.message}`);
  process.exitCode = 1;
}
