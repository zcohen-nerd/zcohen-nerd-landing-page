import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {test} from 'node:test';

const clean = {
  vulnerabilities: {},
  metadata: {
    vulnerabilities: {total: 0, critical: 0, high: 0, moderate: 0, low: 0},
  },
};
const cases = [
  ['clean report passes', JSON.stringify(clean), 0],
  [
    'low severity fails',
    JSON.stringify({
      vulnerabilities: {example: {severity: 'low'}},
      metadata: {
        vulnerabilities: {...clean.metadata.vulnerabilities, low: 1, total: 1},
      },
    }),
    1,
  ],
  ['registry error fails', JSON.stringify({error: {code: 'E503'}}), 1],
  ['missing report fields fail', '{}', 1],
  ['malformed report fails', 'not JSON', 1],
  [
    'inconsistent clean count fails',
    JSON.stringify({
      ...clean,
      vulnerabilities: {example: {severity: 'high'}},
    }),
    1,
  ],
];
for (const [name, input, expected] of cases) {
  test(name, () => {
    const result = spawnSync(process.execPath, ['scripts/audit-ci.mjs'], {
      input,
      encoding: 'utf8',
      timeout: 5000,
    });
    assert.equal(result.status, expected, result.stderr);
  });
}
